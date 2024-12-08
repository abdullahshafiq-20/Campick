import { Metadata } from 'next';
import { OverViewPageView } from '@/sections/overview/view';

export const metadata: Metadata = {
  title: 'Dashboard : Shop owner'
};

export default function DashboardPage() {
  return <OverViewPageView />;
}
