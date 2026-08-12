"use client";

import React, { use } from 'react';
import { LineDetailsContent } from '@/components/dashboard/LineDetailsContent';

export default function LineDetailsPage({ params }) {
  const { id } = use(params);
  return <LineDetailsContent id={id} month="live" backUrl="/lines" />;
}
