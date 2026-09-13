"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { LineDetailsContent } from '@/components/dashboard/LineDetailsContent';

export default function LineDetailsPage() {
  const params = useParams();
  const id = params?.id;
  return <LineDetailsContent id={id} month="live" backUrl="/lines" />;
}
