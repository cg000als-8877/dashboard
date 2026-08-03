"use client";

import React, { use } from 'react';
import { LineDetailsContent } from '@/components/dashboard/LineDetailsContent';

export default function ArchiveLineDetailsPage({ params }) {
  const { month, id } = use(params);
  
  return <LineDetailsContent id={id} month={month} backUrl={`/archive/${month}`} />;
}
