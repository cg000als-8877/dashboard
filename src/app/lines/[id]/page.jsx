import React from 'react';
import { LineDetailsContent } from '@/components/dashboard/LineDetailsContent';

export function generateStaticParams() {
  return [
    { id: 'a' },
    { id: 'b' },
    { id: 'c' },
    { id: 'd' }
  ];
}

export default async function LineDetailsPage({ params }) {
  const { id } = await params;
  return <LineDetailsContent id={id} month="live" backUrl="/lines" />;
}
