import { PAYPAL_SANDBOX_BASE } from './paypal-core.mjs';

export function requirePayPalSandboxEnvironment() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  const environment = process.env.PAYPAL_ENV;
  const enabled = process.env.PAYPAL_SANDBOX_ENABLED === 'true';
  const missing = [
    !clientId && 'PAYPAL_CLIENT_ID',
    !clientSecret && 'PAYPAL_CLIENT_SECRET',
    !webhookId && 'PAYPAL_WEBHOOK_ID',
    environment !== 'sandbox' && 'PAYPAL_ENV=sandbox',
    !enabled && 'PAYPAL_SANDBOX_ENABLED=true',
  ].filter(Boolean);

  if (missing.length > 0) {
    console.error(JSON.stringify({
      level: 'error',
      event: 'paypal_sandbox_environment_missing',
      missing,
    }));
    throw Object.assign(new Error('PayPal Sandbox checkout is not configured.'), {
      status: 503,
      code: 'PAYMENT_ENV_MISSING',
    });
  }

  return {
    clientId: clientId!,
    clientSecret: clientSecret!,
    webhookId: webhookId!,
    baseUrl: PAYPAL_SANDBOX_BASE,
  };
}

async function accessToken() {
  const env = requirePayPalSandboxEnvironment();
  const basic = Buffer.from(`${env.clientId}:${env.clientSecret}`, 'utf8').toString('base64');
  const response = await fetch(`${env.baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      authorization: `Basic ${basic}`,
      'content-type': 'application/x-www-form-urlencoded',
      accept: 'application/json',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  });
  const body = await response.json().catch(() => ({})) as { access_token?: string };
  if (!response.ok || !body.access_token) {
    throw Object.assign(new Error('PayPal Sandbox authentication failed.'), {
      status: 502,
      statusCode: response.status,
      code: 'PAYPAL_AUTH_FAILED',
    });
  }
  return { env, token: body.access_token };
}

export async function paypalSandboxRequest(path: string, init: RequestInit = {}, requestId?: string) {
  if (!path.startsWith('/')) throw new Error('Invalid PayPal API path.');
  const { env, token } = await accessToken();
  const response = await fetch(`${env.baseUrl}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${token}`,
      accept: 'application/json',
      'content-type': 'application/json',
      ...(requestId ? { 'paypal-request-id': requestId } : {}),
      ...(init.headers || {}),
    },
    cache: 'no-store',
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error(JSON.stringify({
      level: 'error',
      event: 'paypal_sandbox_request_failed',
      path,
      providerStatus: response.status,
      providerName: typeof body === 'object' && body && 'name' in body ? String(body.name) : null,
    }));
    throw Object.assign(new Error('PayPal Sandbox request failed.'), {
      status: 502,
      statusCode: response.status,
      code: 'PAYPAL_API_FAILED',
    });
  }
  return body;
}

export async function verifyPayPalWebhook(request: Request, event: unknown) {
  const env = requirePayPalSandboxEnvironment();
  const requiredHeaders = {
    auth_algo: request.headers.get('paypal-auth-algo'),
    cert_url: request.headers.get('paypal-cert-url'),
    transmission_id: request.headers.get('paypal-transmission-id'),
    transmission_sig: request.headers.get('paypal-transmission-sig'),
    transmission_time: request.headers.get('paypal-transmission-time'),
  };
  if (Object.values(requiredHeaders).some((value) => !value)) return false;

  const result = await paypalSandboxRequest('/v1/notifications/verify-webhook-signature', {
    method: 'POST',
    body: JSON.stringify({
      ...requiredHeaders,
      webhook_id: env.webhookId,
      webhook_event: event,
    }),
  }) as { verification_status?: string };

  return result.verification_status === 'SUCCESS';
}
