import { createHmac } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { BUSINESS_SOLUTIONS } from '@/app/employees/catalog';

export const runtime = 'nodejs';

const CONTACTS = new Set(['email', 'phone', 'whatsapp', 'video_call']);
const VOLUMES = new Set(['under_100', '100_500', '501_2000', 'over_2000', 'unknown']);
const TIMELINES = new Set(['exploring', 'within_30_days', 'one_to_three_months', 'later']);
const BUDGETS = new Set(['under_100_usd', '100_300_usd', '301_750_usd', '751_2000_usd', 'over_2000_usd', 'custom', 'unknown']);
const SOLUTIONS = new Set(BUSINESS_SOLUTIONS.map((solution) => solution.slug));
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const PHONE = /^\+?[0-9][0-9\s().-]{6,30}$/;

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error('Consultation requests are not configured.');
  return value;
}

function text(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function fingerprint(secret: string, value: string) {
  return createHmac('sha256', secret).update(value).digest('hex');
}

function serviceClient() {
  return createClient(required('NEXT_PUBLIC_SUPABASE_URL'), required('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function sameOrigin(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try {
    return new URL(origin).hostname === request.nextUrl.hostname;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Request origin was not accepted.' }, { status: 403 });

  try {
    const body = await request.json() as Record<string, unknown>;
    if (text(body.companyFax, 200)) return NextResponse.json({ accepted: true });

    const contactName = text(body.contactName, 120);
    const company = text(body.company, 160);
    const workEmail = text(body.workEmail, 254).toLowerCase();
    const phone = text(body.phone, 32);
    const country = text(body.country, 100);
    const timezone = text(body.timezone, 100);
    const preferredContact = text(body.preferredContact, 30);
    const bestContactTime = text(body.bestContactTime, 120);
    const selectedSolution = text(body.selectedSolution, 80);
    const workflowProblem = text(body.workflowProblem, 3000);
    const monthlyVolume = text(body.monthlyVolume, 30);
    const languages = text(body.languages, 300);
    const targetOutcome = text(body.targetOutcome, 500);
    const timeline = text(body.timeline, 30);
    const budgetBand = text(body.budgetBand, 40);
    const customBudget = text(body.customBudget, 300);
    const otherSystems = text(body.otherSystems, 500);
    const systems = Array.isArray(body.systems)
      ? [...new Set(body.systems.map((item) => text(item, 80)).filter(Boolean))].slice(0, 12)
      : [];

    if (contactName.length < 2 || company.length < 2 || !EMAIL.test(workEmail)) throw new Error('Enter valid contact and company details.');
    if (phone && !PHONE.test(phone)) throw new Error('Enter a valid phone number or leave it blank.');
    if (!country || !timezone || !bestContactTime) throw new Error('Country, timezone and best contact time are required.');
    if (!CONTACTS.has(preferredContact) || !SOLUTIONS.has(selectedSolution)) throw new Error('Choose a valid contact method and solution.');
    if (workflowProblem.length < 20 || targetOutcome.length < 10) throw new Error('Describe the workflow and target outcome in a little more detail.');
    if (!VOLUMES.has(monthlyVolume) || !TIMELINES.has(timeline) || !BUDGETS.has(budgetBand)) throw new Error('Choose valid volume, timeline and budget options.');
    if (!languages) throw new Error('Tell us which languages are needed.');
    if (budgetBand === 'custom' && !customBudget) throw new Error('Add the custom budget details.');
    if (body.consent !== true) throw new Error('Consent is required before we can contact you.');
    if (body.integrationCostsAcknowledged !== true || body.commercialTermsAcknowledged !== true) throw new Error('Review and accept the integration and commercial acknowledgements.');

    const secret = required('BUSINESS_REQUEST_HASH_SECRET');
    const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const ipHash = fingerprint(secret, forwarded);
    const requestFingerprint = fingerprint(secret, [workEmail, company.toLowerCase(), selectedSolution, workflowProblem.toLowerCase()].join('|'));
    const supabase = serviceClient();

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count, error: countError } = await supabase
      .from('business_solution_requests')
      .select('id', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('created_at', since);
    if (countError) throw countError;
    if ((count || 0) >= 5) return NextResponse.json({ error: 'Request limit reached. Please email info@agentshive.net.' }, { status: 429 });

    const { error } = await supabase.from('business_solution_requests').insert({
      contact_name: contactName,
      company_name: company,
      work_email: workEmail,
      phone: phone || null,
      country,
      timezone,
      preferred_contact_channel: preferredContact,
      best_contact_time: bestContactTime,
      selected_solution: selectedSolution,
      workflow_problem: workflowProblem,
      monthly_volume: monthlyVolume,
      systems,
      other_systems: otherSystems || null,
      languages,
      target_outcome: targetOutcome,
      timeline,
      budget_band: budgetBand,
      custom_budget: customBudget || null,
      consent_to_contact: true,
      integration_costs_acknowledged: true,
      commercial_terms_acknowledged: true,
      consented_at: new Date().toISOString(),
      source: 'business_consultation_page',
      ip_hash: ipHash,
      request_fingerprint: requestFingerprint,
      notification_status: 'pending',
    });

    if (error && error.code !== '23505') throw error;
    return NextResponse.json({ accepted: true });
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : '';
    const validationPrefixes = ['Enter ', 'Country,', 'Choose ', 'Describe ', 'Tell us ', 'Add the ', 'Consent ', 'Review and '];
    const safeMessage = message.includes('configured')
      ? 'Consultation requests are temporarily unavailable. Please email info@agentshive.net.'
      : validationPrefixes.some((prefix) => message.startsWith(prefix))
        ? message
        : 'Your request could not be saved. Please try again or email info@agentshive.net.';
    return NextResponse.json({ error: safeMessage }, { status: 400 });
  }
}
