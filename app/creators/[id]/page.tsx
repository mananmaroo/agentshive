'use client';

import { useParams } from 'next/navigation';
import { CreatorProfile } from '@/app/components/creator-profile';

export default function CreatorByIdPage() {
  const params = useParams();
  return <CreatorProfile by="id" value={params.id as string} />;
}
