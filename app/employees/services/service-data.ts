export type ServicePage = {
  slug: string;
  solution: string;
  title: string;
  h1: string;
  description: string;
  summary: string;
  problems: readonly string[];
  workflows: readonly string[];
  deliverables: readonly string[];
  safeguards: readonly string[];
  related: readonly string[];
};

export const SERVICE_PAGES: readonly ServicePage[] = [
  {
    slug: 'billing-invoicing-software', solution: 'billing-invoicing',
    title: 'Custom Billing & Invoicing Software for US Businesses',
    h1: 'Billing and invoicing software built around your workflow',
    description: 'Scope custom billing and invoicing software for estimates, invoices, approvals, payment status, reminders and reporting for a US business.',
    summary: 'AgentsHive can design a billing workspace around the way your team prepares, approves, sends and follows up on invoices.',
    problems: ['Duplicate spreadsheet entry', 'Unclear invoice and payment status', 'Manual approval and reminder handoffs'],
    workflows: ['Customer and item setup', 'Estimate, approval and invoice preparation', 'Payment-status updates, reminders and dispute escalation'],
    deliverables: ['Workflow discovery and scoped data model', 'Role-based billing workspace', 'Import, export and reporting requirements', 'Operating documentation and acceptance checklist'],
    safeguards: ['Tax, accounting and payment-processing requirements are reviewed with your qualified advisers and providers.', 'Financial exceptions and write-offs stay behind approved roles.', 'Connections depend on available APIs, permissions and provider terms.'],
    related: ['inventory-management-software', 'business-process-automation', 'custom-web-application-development'],
  },
  {
    slug: 'inventory-management-software', solution: 'inventory-stock-management',
    title: 'Custom Inventory Management Software for US Businesses',
    h1: 'Inventory management software designed for your stock workflow',
    description: 'Plan a custom inventory and stock-management system for receipts, movements, locations, reorder signals and reporting.',
    summary: 'AgentsHive can scope a stock-control system for teams that have outgrown spreadsheets or poorly matched generic tools.',
    problems: ['Unclear stock by location', 'Manual adjustments without a review trail', 'Purchasing and order information that does not line up'],
    workflows: ['Catalog and SKU setup', 'Receipts, transfers and controlled adjustments', 'Reorder signals, purchasing and reconciliation'],
    deliverables: ['Inventory workflow map', 'Scoped catalog and movement model', 'Role and adjustment controls', 'Migration, reconciliation and export plan'],
    safeguards: ['Stock accuracy depends on source data, operating procedures and reconciliation.', 'Barcode, commerce, accounting and real-time connections are included only when scoped and verified.', 'Sensitive adjustments require agreed permissions and review.'],
    related: ['billing-invoicing-software', 'business-process-automation', 'internal-business-tools'],
  },
  {
    slug: 'business-process-automation', solution: 'business-process-automation',
    title: 'Business Process Automation Services USA',
    h1: 'Business process automation for connected day-to-day operations',
    description: 'Map and automate repeatable work across email, CRM, spreadsheets, forms, support and internal operations with human controls.',
    summary: 'AgentsHive can connect repeatable operational steps while keeping exceptions, approvals and ownership visible to your team.',
    problems: ['Copying the same data between tools', 'Missed handoffs and follow-ups', 'Processes that depend on one person remembering every step'],
    workflows: ['Form or email intake and classification', 'CRM, spreadsheet and task handoffs', 'Exception queues, approvals and operating summaries'],
    deliverables: ['Current-state workflow map', 'Trigger, rule and exception design', 'Controlled implementation and test cases', 'Documentation and change-control plan'],
    safeguards: ['Customer-authorized credentials and least access are used where feasible.', 'Retries, deduplication, logs and exception handling are scoped before launch.', 'Sensitive actions remain subject to human approval.'],
    related: ['ai-workflow-automation', 'custom-web-application-development', 'billing-invoicing-software'],
  },
  {
    slug: 'ai-workflow-automation', solution: 'ai-workflow-automation',
    title: 'AI Workflow Automation Services USA',
    h1: 'AI workflow automation with human oversight',
    description: 'Design AI-assisted workflows for triage, extraction, drafting, routing and follow-up across approved business systems.',
    summary: 'AgentsHive can add AI where judgment support helps and deterministic rules where consistency matters.',
    problems: ['High-volume information triage', 'Manual extraction and summarization', 'Drafting and routing work that still needs review'],
    workflows: ['Trigger and approved context', 'AI classification, extraction or drafting', 'Validation, approval, action logging and escalation'],
    deliverables: ['Use-case and risk assessment', 'Approved-context and test-set design', 'Human-review and fallback rules', 'Monitoring and operating documentation'],
    safeguards: ['AI outputs can be incorrect; validation and escalation rules are configured for each workflow.', 'No autonomous external action is assumed.', 'Data sources, permissions and retention are agreed during discovery.'],
    related: ['business-process-automation', 'ai-voice-agents', 'ai-app-development'],
  },
  {
    slug: 'ai-voice-agents', solution: 'ai-voice-agents',
    title: 'Custom AI Voice Agents for US Businesses',
    h1: 'AI voice agents designed for your call workflow',
    description: 'Scope AI voice agents for inbound calls, outbound follow-up, qualification, appointment requests and support with human escalation.',
    summary: 'AgentsHive can design a controlled voice workflow, but calling remains inactive until the provider, number, scripts, consent requirements and testing are approved.',
    problems: ['Repeated inbound questions', 'Follow-up calls that need consistent scripts', 'Appointment and qualification intake that requires a human handoff'],
    workflows: ['Disclosure and caller intent', 'Approved answer or structured intake', 'Booking request, follow-up or human transfer', 'Call outcome and exception reporting'],
    deliverables: ['Call-flow and script design', 'Provider and number requirements', 'Knowledge boundaries and escalation rules', 'Test, monitoring and reporting plan'],
    safeguards: ['Consent, recording notice, quiet hours and applicable calling rules must be reviewed before activation.', 'Emergency and regulated-topic escape paths are required where relevant.', 'Call caps, human transfer and approval controls are scoped per business.'],
    related: ['ai-workflow-automation', 'business-process-automation', 'ai-app-development'],
  },
  {
    slug: 'small-business-website-development', solution: 'business-website-development',
    title: 'Small Business Website Development USA',
    h1: 'Business websites built to turn interest into action',
    description: 'Scope a mobile-friendly US small-business website with clear services, intake, booking or consultation paths.',
    summary: 'AgentsHive can design and build a business or service website around your offer, buyer journey and operational handoffs.',
    problems: ['A site that does not explain the offer clearly', 'Leads lost between pages, forms and follow-up', 'Outdated content or disconnected operations'],
    workflows: ['Service discovery and information architecture', 'Conversion-focused page and form flow', 'Lead routing, measurement and content handoff'],
    deliverables: ['Page and content scope', 'Responsive implementation', 'Accessible forms and operational handoffs', 'Launch and maintenance checklist'],
    safeguards: ['Performance, platform support and delivery dates are confirmed only after scope.', 'Analytics and third-party services require customer approval.', 'Search visibility grows over time and is never guaranteed.'],
    related: ['custom-web-application-development', 'ai-app-development', 'business-process-automation'],
  },
  {
    slug: 'custom-web-application-development', solution: 'custom-web-application',
    title: 'Custom Web Application Development USA',
    h1: 'Custom web applications for real business operations',
    description: 'Design web applications, portals, dashboards and installable web experiences around a US business workflow.',
    summary: 'AgentsHive can scope customer portals, internal tools and operational web applications instead of forcing the workflow into generic software.',
    problems: ['Disconnected tools and duplicate entry', 'Manual customer or staff requests', 'Limited visibility into work and exceptions'],
    workflows: ['Intake, roles and approvals', 'Customer portal or internal operations', 'Billing, booking, CRM, inventory or reporting handoffs'],
    deliverables: ['Product and workflow discovery', 'Interface and data-model scope', 'Responsive application build', 'Acceptance, documentation and handover plan'],
    safeguards: ['Supported platforms, integrations and service levels are agreed in the proposal.', 'Access, data handling and recovery requirements are reviewed before launch.', 'Examples describe possible scope, not preconfigured features.'],
    related: ['internal-business-tools', 'small-business-website-development', 'ai-app-development'],
  },
  {
    slug: 'ai-app-development', solution: 'ai-enabled-application',
    title: 'Custom AI App Development for US Businesses',
    h1: 'AI-enabled websites and applications with practical controls',
    description: 'Scope AI applications using chat, voice, document processing, search, recommendations or workflow automation with human oversight.',
    summary: 'AgentsHive can design AI-enabled software around approved data, specific tasks and clear review paths.',
    problems: ['Knowledge spread across documents and systems', 'Manual document or enquiry processing', 'Generic AI tools without business controls'],
    workflows: ['Approved search and question answering', 'Document intake, extraction and review', 'Recommendations, drafting and workflow handoff'],
    deliverables: ['Use-case and model/provider assessment', 'Grounding, interface and workflow design', 'Evaluation and approval controls', 'Usage, monitoring and support plan'],
    safeguards: ['Model and provider access is selected during discovery.', 'AI outputs require testing, monitoring and appropriate human review.', 'No accuracy, availability or performance outcome is guaranteed.'],
    related: ['ai-workflow-automation', 'custom-web-application-development', 'ai-voice-agents'],
  },
  {
    slug: 'internal-business-tools', solution: 'internal-business-tools',
    title: 'Custom Internal Business Tools & Dashboards USA',
    h1: 'Internal tools and dashboards shaped around your team',
    description: 'Build scoped internal tools, operational dashboards, portals and reporting workflows for a US business.',
    summary: 'AgentsHive can modernize spreadsheet-heavy processes with a purpose-built workspace and connected handoffs.',
    problems: ['Operational status scattered across files', 'Manual approvals and reporting', 'Legacy systems that are difficult to change'],
    workflows: ['Staff intake and task routing', 'Approvals, exceptions and audit views', 'CRM, billing, inventory and reporting connections'],
    deliverables: ['Workflow and role map', 'Dashboard or internal-tool scope', 'Integration and migration plan', 'Acceptance and operating documentation'],
    safeguards: ['Existing-system modernization starts with a dependency and data review.', 'Access and export requirements are defined before build.', 'Named integrations are not promised until compatibility is verified.'],
    related: ['custom-web-application-development', 'business-process-automation', 'inventory-management-software'],
  },
];

export function getService(slug: string) { return SERVICE_PAGES.find((service) => service.slug === slug); }
