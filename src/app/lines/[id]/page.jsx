"use client";

import React, { use } from 'react';
import { LineDetailsContent } from '@/components/dashboard/LineDetailsContent';

export default function LineDetailsPage({ params }) {
  const { id } = use(params); // 'a', 'b', 'c', or 'd'
  
  return <LineDetailsContent id={id} month="live" backUrl="/lines" />;
}
