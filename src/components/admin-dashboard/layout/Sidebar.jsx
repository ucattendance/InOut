import React from 'react';
import { NavLink } from 'react-router-dom';
import './layout.css';
import {
  FiHome, FiUsers, FiCalendar, FiBarChart2, FiSettings, FiLogOut,
  FiFileText, FiDollarSign, FiCamera, FiChevronRight
} from 'react-icons/fi';

const menuItems = [
  { label: 'Dashboard', icon: <FiHome />, path: '/dashboard' },
  { label: 'Monthly Reports', icon: <FiCamera />, path: '/reports' },
  {
    label: 'User Management',
    icon: <FiUsers />,
    subItems: [
      { label: 'User profiles', path: '/all-users' },
      { label: 'Add User', path: '/add-user' },
      { label: 'Employees Schedules', path: '/employees' },
      
      { label: 'Pending Approvals', path: '/pending-users' }
    ]
  },
  {
    label: 'Leaves & Lates',
    icon: <FiCalendar />,
    subItems: [
      { label: 'Leave Records', path: '/leave-requests' },
      { label: 'Late comments', path: '/comments' }
    ]
  },
      {
        label: 'Documents',
        icon: <FiFileText />,
        subItems: [
          { label: 'Experience Letters', path: '/experience-letters' },
          { label: 'Internship Certificate', path: '/internship-letter' },
          { label: 'Internship Offer Letter', path: '/internship-offer' },
          { label: 'Offer Letters', path: '/offer-letters' },
          { label: 'All Letters', path: '/all-letters' },
          { label: 'Relieving Letters', path: '/relieving-letters' },
          { label: 'Upload Documents', path: '/coming-soon/upload-documents' }
        ]
      },
  { label: 'Pay History', icon: <FiDollarSign />, path: '/salaryhistory' },
  { label: 'Payslip Generator', icon: <FiBarChart2 />, path: '/payslip' },
  { label: 'Holiday List', icon: <FiCalendar />, path: '/holidays' },
  { label: 'API Docs', icon: <FiFileText />, path: '/api-docs' },
  { label: 'Settings', icon: <FiSettings />, path: '/coming-soon/settings' }
];

export const APP_BUILD = 'v2026.06.09';

const Sidebar = ({ isOpen, setIsOpen }) => {
  // Open the 'Documents', 'Leaves & Lates', and 'User Management' submenus by default
  const [expandedItems, setExpandedItems] = React.useState({
    Documents: true,
    'Leaves & Lates': true,
    'User Management': true
  });

  const toggleItem = (label) => {
    setExpandedItems(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <>
      <aside className={`admin-sidebar ${isOpen ? 'is-open' : ''}`}>
        <div className="admin-sidebar-brand">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/inout-logo.png" alt="INOUT logo" style={{ height: 60, width: 'auto' }} />
          </div>
          <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 500, opacity: 0.75, marginTop: 2 }}>
            {APP_BUILD}
          </span>
        </div>

        <nav className="admin-sidebar-nav">
          {menuItems.map((item, index) => {
            if (item.subItems) {
              return (
                <div key={index} className="mb-1">
                  <button
                    type="button"
                    onClick={() => toggleItem(item.label)}
                    className="admin-nav-btn"
                    style={{ justifyContent: 'space-between' }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </span>
                    <FiChevronRight
                      style={{
                        transform: expandedItems[item.label] ? 'rotate(90deg)' : 'none',
                        transition: 'transform 0.2s',
                      }}
                    />
                  </button>

                  {expandedItems[item.label] && (
                    <div className="admin-nav-submenu">
                      {item.subItems.map((subItem, subIndex) => (
                        <NavLink
                          key={subIndex}
                          to={subItem.path}
                          className={({ isActive }) =>
                            `admin-nav-sublink${isActive ? ' active' : ''}`
                          }
                          onClick={() => setIsOpen(false)}
                        >
                          {subItem.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <NavLink
                key={index}
                to={item.path}
                className={({ isActive }) =>
                  `admin-nav-link${isActive ? ' active' : ''}`
                }
                onClick={() => setIsOpen(false)}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          <div className="admin-nav-logout-wrap">
            <button
              type="button"
              onClick={handleLogout}
              className="admin-nav-btn admin-nav-logout"
            >
              <FiLogOut />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </aside>

      {isOpen && (
        <div
          className="admin-sidebar-overlay"
          role="presentation"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
