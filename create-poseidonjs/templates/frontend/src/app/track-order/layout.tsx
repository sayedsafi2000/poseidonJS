import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Track order — PoseidonJS',
  description: 'Look up your order status with your order number and email.',
};

export default function TrackOrderLayout({ children }: { children: React.ReactNode }) {
  return children;
}
