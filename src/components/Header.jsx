import { useState } from 'react';
import { motion } from 'framer-motion';
import CompanyInfo from './CompanyInfo';
import './Header.css';

function Header({ user, onLogout }) {
  const [showCompanyInfo, setShowCompanyInfo] = useState(false);

  return (
    <>
      <motion.header
        className="header"
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="header-inner">
          <div className="logo-group" onClick={() => setShowCompanyInfo(true)} style={{ cursor: 'pointer' }} title="View Company Details">
            <motion.img
              className="logo-img"
              src="/logo.png"
              alt="Bandhanam Private Limited"
              whileHover={{ scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 300 }}
            />
            <div className="logo-text">
              <span className="logo-subtitle">Management Application</span>
            </div>
          </div>

          <div className="header-right">
            {user && (
              <>
                <button className="company-info-btn" onClick={() => setShowCompanyInfo(true)} title="Company Details">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                </button>
                <motion.div
                  className="user-badge"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                >
                  <span className="user-avatar">{user.charAt(0).toUpperCase()}</span>
                  <span className="user-name">{user}</span>
                  <button className="logout-btn" onClick={onLogout} title="Sign out" aria-label="Sign out">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                  </button>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </motion.header>

      <CompanyInfo isOpen={showCompanyInfo} onClose={() => setShowCompanyInfo(false)} />
    </>
  );
}

export default Header;
