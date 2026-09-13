"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { LineDetailsContent } from '@/components/dashboard/LineDetailsContent';

export default function ArchiveLineDetailsPage() {
  const params = useParams();
  const month = params?.month;
  const id = params?.id;
  
  return <LineDetailsContent id={id} month={month} backUrl={`/archive/${month}`} />;
}
