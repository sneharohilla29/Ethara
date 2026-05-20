import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { IoMenuOutline } from 'react-icons/io5';
import { HiOutlineBolt } from 'react-icons/hi2';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="main-content">
        <div className="mobile-header">
          <button
            className="mobile-menu-btn"
            onClick={() => setSidebarOpen(true)}
          >
            <IoMenuOutline size={22} />
          </button>
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon" style={{ width: 28, height: 28, fontSize: 14 }}>
              <HiOutlineBolt />
            </div>
            <span className="sidebar-logo-text" style={{ fontSize: 16 }}>TaskFlow</span>
          </div>
        </div>

        <div className="page-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
