import ConsultationForm from './ConsultationForm';
import { BUSINESS_SOLUTIONS, getSolution } from '../catalog';

export const metadata = {
  title: 'Request an AI solution consultation | AgentsHive Business',
  description: 'Tell AgentsHive about the workflow, outcome and systems you want to improve.',
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
