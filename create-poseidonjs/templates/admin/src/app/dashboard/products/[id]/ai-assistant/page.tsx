'use client';

import { useParams } from 'next/navigation';
import VendorAIAssistant from '@/components/VendorAIAssistant';

export default function ProductAIAssistantPage() {
  const params = useParams();
  const productId = params.id as string;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Content Assistant</h1>
      <VendorAIAssistant productId={productId} />
    </div>
  );
}

