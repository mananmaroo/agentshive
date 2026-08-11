import Razorpay from 'razorpay';
import type { NextRequest } from 'next/server';
import {
  requirePaymentBackendEnvironment,
  requirePaymentUser as requireSharedPaymentUser,
  requireProposal,
  routeError,
} from './payment-server';

export { requireProposal, routeError };

export function requirePaymentEnvironment() {
  const base = requirePaymentBackendEnvironment();
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const missing = [
    !keyId && 'RAZORPAY_KEY_ID',
    !keySecret && 'RAZORPAY_KEY_SECRET',
  ].filter(Boolean);
  if (missing.length > 0) {
    console.error(JSON.stringify({
      level: 'error',
      event: 'payment_environment_missing',
      missing,
    }));
    throw Object.assign(new Error('Payment preview is not configured.'), {
      status: 503,
      code: 'PAYMENT_ENV_MISSING',
    });
  }
  return { ...base, keyId: keyId!, keySecret: keySecret! };
}

export async function requirePaymentUser(request: NextRequest) {
  const session = await requireSharedPaymentUser(request);
  return { ...session, env: requirePaymentEnvironment() };
}

export function razorpayClient() {
  const env = requirePaymentEnvironment();
  return new Razorpay({ key_id: env.keyId, key_secret: env.keySecret });
}
