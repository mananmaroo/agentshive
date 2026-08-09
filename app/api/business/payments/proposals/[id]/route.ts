import type { NextRequest } from 'next/server';
import { resolveServerPrice, validProposalId } from '@/app/lib/payments/razorpay-core.mjs';
import { requirePaymentUser, requireProposal, routeError } from '@/app/lib/payments/razorpay-server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    if (!validProposalId(id)) {
      return Response.json({ error: 'A valid proposal is required.' }, { status: 400 });
    }
    const { user, admin } = await requirePaymentUser(request);
    const { proposal, organization } = await requireProposal(admin, user, id);
    const price = resolveServerPrice(organization.billing_country, proposal.price_book_id);
    return Response.json({
      proposalId: proposal.id,
      organizationName: organization.name,
      customerEmail: proposal.customer_email || user.email,
      priceBookId: price.priceBookId,
      description: price.label,
      amount: price.amount,
      currency: price.currency,
      billingCountry: price.billingCountry,
      expiresAt: proposal.expires_at,
      testMode: true,
    }, { headers: { 'cache-control': 'no-store' } });
  } catch (error) {
    return routeError(error);
  }
}
