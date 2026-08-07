import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import { Outlet } from 'react-router-dom';
import './layout.css';

const Layout = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  return (
    <div className={`admin-layout${sidebarExpanded ? ' sidebar-expanded' : ''}`}>
      <Sidebar
        expanded={sidebarExpanded}
        onExpand={() => setSidebarExpanded(true)}
        onCollapse={() => setSidebarExpanded(false)}
      />

      <div className="admin-main">
        <TopNavbar />

        <main className="admin-content">
          <div className="admin-content-inner">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
