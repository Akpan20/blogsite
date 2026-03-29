import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function DashboardLayout() {
  const [navCollapsed, setNavCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Left nav */}
      <Navbar
        variant="dashboard"
        isCollapsed={navCollapsed}
        onToggle={() => setNavCollapsed((c) => !c)}
      />

      {/* Center column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

      {/* Right sidebar */}
      <div className="hidden xl:flex w-80 shrink-0 h-screen overflow-y-auto border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <Sidebar variant="dashboard" sticky={false} />
      </div>
    </div>
  );
}