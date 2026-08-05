import { NextRequest, NextResponse } from 'next/server';
import { createBusinessAdminClient, requirePlatformAdmin } from '@/app/lib/business-admin-server';

export const runtime = 'nodejs';

const EMPLOYEE_TYPES = new Set(['aarya_admissions', 'kabir_lead_followup']);
const PLANS = new Set(['pilot', 'starter', 'growth', 'custom']);
const PAYMENTS = new Set(['unpaid', 'manual_confirmed', 'waived', 'refunded']);

function failure(error: unknown) {
  const message = error instanceof Error ? error.message : 'Admin operation failed.';
  const status = message === 'UNAUTHORIZED' ? 401 : message === 'FORBIDDEN' ? 403 : 400;
  return NextResponse.json({ error: status === 401 ? 'Sign in required.' : status === 403 ? 'Platform admin access required.' : message }, { status });
}

async function findAuthUserByEmail(email: string) {
  const admin = createBusinessAdminClient();
  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw error;
    const user = data.users.find((item) => item.email?.toLowerCase() === email);
    if (user || data.users.length < 100) return user || null;
  }
  throw new Error('User directory search exceeded the pilot limit.');
}

export async function GET(request: NextRequest) {
  try {
    await requirePlatformAdmin(request);
    const admin = createBusinessAdminClient();
    const [organizationsResult, membershipsResult, auditResult] = await Promise.all([
      admin.from('business_organizations').select('id,name,root_url,employee_type,pilot_access_status,access_expires_at,plan_code,payment_status,payment_notes,status,voice_status,created_at').order('created_at', { ascending: false }),
      admin.from('business_organization_members').select('organization_id,user_id,role,created_at').order('created_at', { ascending: false }),
      admin.from('business_admin_audit_events').select('id,organization_id,action,details,created_at').order('created_at', { ascending: false }).limit(50),
    ]);
    const firstError = organizationsResult.error || membershipsResult.error || auditResult.error;
    if (firstError) throw firstError;

    const users = new Map<string, { email: string | null }>();
    for (let page = 1; page <= 10; page += 1) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 100 });
      if (error) throw error;
      data.users.forEach((user) => users.set(user.id, { email: user.email || null }));
      if (data.users.length < 100) break;
    }

    const memberships = (membershipsResult.data || []).map((membership) => ({
      ...membership,
      email: users.get(membership.user_id)?.email || null,
    }));
    return NextResponse.json({ organizations: organizationsResult.data || [], memberships, audit: auditResult.data || [] });
  } catch (error) {
    return failure(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const platformAdmin = await requirePlatformAdmin(request);
    const body = await request.json() as {
      email?: string; organizationName?: string; rootUrl?: string; employeeType?: string; expiresAt?: string;
    };
    const email = body.email?.trim().toLowerCase() || '';
    const organizationName = body.organizationName?.trim() || '';
    const rootUrl = body.rootUrl?.trim() || '';
    const employeeType = body.employeeType || 'aarya_admissions';
    const expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('Enter a valid business email.');
    if (organizationName.length < 2 || organizationName.length > 160) throw new Error('Enter an organization name.');
    if (!/^https:\/\//i.test(rootUrl)) throw new Error('Use an HTTPS organization website.');
    if (!EMPLOYEE_TYPES.has(employeeType)) throw new Error('Unsupported employee type.');
    if (!expiresAt || Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date()) throw new Error('Choose a future access expiry.');

    const admin = createBusinessAdminClient();
    let authUser = await findAuthUserByEmail(email);
    let invitationSent = false;
    if (!authUser) {
      const origin = new URL(request.url).origin;
      const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${origin}/auth/reset-password`,
        data: { business_invite: true },
      });
      if (error || !data.user) throw error || new Error('Could not create the invitation.');
      authUser = data.user;
      invitationSent = true;
    }

    const { data: existing } = await admin.from('business_organizations').select('id').ilike('name', organizationName).limit(1).maybeSingle();
    let organizationId = existing?.id as string | undefined;
    if (!organizationId) {
      const { data, error } = await admin.from('business_organizations').insert({
        name: organizationName,
        root_url: rootUrl,
        employee_type: employeeType,
        pilot_access_status: 'active',
        access_expires_at: expiresAt.toISOString(),
        plan_code: 'pilot',
        payment_status: 'waived',
        access_grace_until: new Date(expiresAt.getTime() + 3 * 86400000).toISOString(),
        status: 'pilot',
      }).select('id').single();
      if (error) throw error;
      organizationId = data.id;
    } else {
      const { error } = await admin.from('business_organizations').update({
        root_url: rootUrl,
        employee_type: employeeType,
        pilot_access_status: 'active',
        access_expires_at: expiresAt.toISOString(),
        access_grace_until: new Date(expiresAt.getTime() + 3 * 86400000).toISOString(),
        payment_status: 'waived',
        status: 'pilot',
        access_updated_at: new Date().toISOString(),
      }).eq('id', organizationId).select('id').single();
      if (error) throw error;
    }

    const { error: membershipError } = await admin.from('business_organization_members').upsert({
      organization_id: organizationId,
      user_id: authUser.id,
      role: 'owner',
    }, { onConflict: 'organization_id,user_id' });
    if (membershipError) throw membershipError;

    const { error: auditError } = await admin.from('business_admin_audit_events').insert({
      admin_user_id: platformAdmin.id,
      organization_id: organizationId,
      action: invitationSent ? 'pilot_invited' : 'pilot_access_granted',
      details: { email, employee_type: employeeType, expires_at: expiresAt.toISOString(), payment_status: 'waived' },
    });
    if (auditError) throw new Error(`Provisioning audit failed: ${auditError.message}`);

    return NextResponse.json({ organizationId, invitationSent, email });
  } catch (error) {
    return failure(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const platformAdmin = await requirePlatformAdmin(request);
    const body = await request.json() as {
      organizationId?: string; action?: string; expiresAt?: string; paymentStatus?: string; planCode?: string; paymentNotes?: string;
    };
    const organizationId = body.organizationId || '';
    if (!/^[0-9a-f-]{36}$/i.test(organizationId)) throw new Error('Invalid organization.');

    const admin = createBusinessAdminClient();
    let changes: Record<string, unknown>;
    if (body.action === 'revoke') changes = { pilot_access_status: 'revoked', access_updated_at: new Date().toISOString() };
    else if (body.action === 'grant') {
      const renewedExpiry = new Date(Date.now() + 30 * 86400000);
      changes = { pilot_access_status: 'active', access_expires_at: renewedExpiry.toISOString(), access_grace_until: new Date(renewedExpiry.getTime() + 3 * 86400000).toISOString(), access_updated_at: new Date().toISOString() };
    }
    else if (body.action === 'extend') {
      const expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
      if (!expiresAt || Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date()) throw new Error('Choose a future expiry.');
      changes = { pilot_access_status: 'active', access_expires_at: expiresAt.toISOString(), access_grace_until: new Date(expiresAt.getTime() + 3 * 86400000).toISOString(), access_updated_at: new Date().toISOString() };
    } else if (body.action === 'payment') {
      if (!PAYMENTS.has(body.paymentStatus || '') || !PLANS.has(body.planCode || '')) throw new Error('Invalid payment or plan value.');
      changes = { payment_status: body.paymentStatus, plan_code: body.planCode, payment_notes: body.paymentNotes?.slice(0, 500) || null, access_updated_at: new Date().toISOString() };
    } else throw new Error('Unsupported admin action.');

    const { data: updated, error } = await admin.from('business_organizations').update(changes).eq('id', organizationId).select('id').maybeSingle();
    if (error) throw error;
    if (!updated) throw new Error('No organization was updated. Refresh the admin portal and try again.');
    const { error: auditError } = await admin.from('business_admin_audit_events').insert({
      admin_user_id: platformAdmin.id,
      organization_id: organizationId,
      action: `access_${body.action}`,
      details: changes,
    });
    if (auditError) throw new Error(`Access audit failed: ${auditError.message}`);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return failure(error);
  }
}
