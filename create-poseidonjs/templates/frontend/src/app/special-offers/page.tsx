import { redirect } from 'next/navigation';

export default function SpecialOffersPage() {
  redirect('/products?offer=true');
}
