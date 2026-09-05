/opt/homebrew/Library/Homebrew/cmd/shellenv.sh: line 18: /bin/ps: Operation not permitted
import ConsultationForm from './ConsultationForm';
import { BUSINESS_SOLUTIONS, getSolution } from '../catalog';

export const metadata = {
  title: 'Request a US Business Software & AI Consultation | AgentsHive',
  description: 'Tell AgentsHive about the software, website, automation, AI workflow or voice-agent service your US business wants to scope.',
  alternates: { canonical: '/employees/custom' },
};

export default async function CustomEmployeeRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ solution?: string }>;
}) {
  const params = await searchParams;
  const selected = getSolution(params.solution)?.slug || 'custom-ai-employee';
  const options = BUSINESS_SOLUTIONS.map(({ slug, name, status }) => ({ slug, name, status }));

  return <ConsultationForm selectedSolution={selected} solutions={options} />;
}
