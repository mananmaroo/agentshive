const PROPOSAL_ID = /^[0-9a-f]{8}-[0-9a-f-]{27,36}$/i;
const RETURN_ORIGIN = 'https://agentshive.invalid';

export function validatedBusinessReturn(value: string | null | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value, RETURN_ORIGIN);
    const proposal = url.searchParams.get('proposal');
    const onlyProposal = [...url.searchParams.keys()].every((key) => key === 'proposal');
    if (
      url.origin !== RETURN_ORIGIN ||
      url.pathname !== '/employees/checkout' ||
      !proposal ||
      !PROPOSAL_ID.test(proposal) ||
      !onlyProposal
    ) return null;
    return `/employees/checkout?proposal=${encodeURIComponent(proposal)}`;
  } catch {
    return null;
  }
}
