import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';

export default function DashboardPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const isChatbot = location.pathname.includes('/chatbot');

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <TopBar toggleSidebar={toggleSidebar} />
        <main className={`flex-1 flex flex-col min-h-0 ${isChatbot ? 'p-0 overflow-hidden' : 'p-4 sm:p-6 lg:p-8 overflow-y-auto'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
