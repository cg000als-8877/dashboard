"use client";

import React from 'react';
import { DashboardContent } from '@/components/dashboard/DashboardContent';

export default function Dashboard() {
  return (
    <div className="dashboard-mobile-stroke-free w-full">
      <DashboardContent month="live" isArchive={false} />
    </div>
  );
}
