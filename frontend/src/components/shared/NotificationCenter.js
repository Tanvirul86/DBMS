import React from 'react';
import './NotificationCenter.css';

// Minimal, safe NotificationCenter to keep build healthy
const NotificationCenter = ({ language = 'bn', onClose, userType = 'farmer' }) => {
  const title = language === 'bn' ? 'বিজ্ঞপ্তি' : 'Notifications';
  const none = language === 'bn' ? 'কোন বিজ্ঞপ্তি নেই' : 'No notifications';

  return (
    <div className="notification-center-overlay">
      <div className="notification-center">
        <div className="notification-header">
          <div className="header-left">
            <h2>{title}</h2>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="notifications-list">
          <div className="no-notifications">
            <p>{none}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
