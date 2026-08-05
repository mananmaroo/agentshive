export type WhatsAppInboundMessage = {
  providerMessageId: string;
  fromE164: string;
  text: string;
  receivedAt: string;
};

export type WhatsAppOutboundMessage = {
  toE164: string;
  templateKey?: string;
  text?: string;
  consentReference: string;
};

export interface WhatsAppProviderAdapter {
  readonly providerName: string;
  verifyWebhookSignature(rawBody: string, signature: string): Promise<boolean>;
  parseInbound(rawBody: string): Promise<WhatsAppInboundMessage[]>;
  sendApprovedMessage(message: WhatsAppOutboundMessage): Promise<{ providerMessageId: string }>;
}

export type WhatsAppConnectionState = 'not_configured' | 'awaiting_customer_provider' | 'configured' | 'paused';

// No provider implementation is included. A customer-approved provider, credentials,
// templates, consent rules and spend limits must be configured before this interface is used.
