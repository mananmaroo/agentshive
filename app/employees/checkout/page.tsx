/opt/homebrew/Library/Homebrew/cmd/shellenv.sh: line 18: /bin/ps: Operation not permitted
import RazorpayCheckout from './RazorpayCheckout';

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ proposal?: string }> }) {
  const { proposal = '' } = await searchParams;
  return <main className="min-h-screen bg-[#020617] px-6 py-20 text-white"><div className="mx-auto max-w-2xl"><RazorpayCheckout proposalId={proposal} /></div></main>;
}
