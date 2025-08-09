// src/components/NotificationIcon.tsx (Fully Optimized Version)

'use client';

import React, { useEffect, useState } from 'react';
import { app } from '@/lib/firebase';
import { getMessaging, getToken } from 'firebase/messaging';

const VAPID_KEY = "BNZH892p7b9hWzbPsIxBiHF78ZZzuHSDnVtDKpVeSrKe-GIloLjQ7xwWW-mxIjyhPC2Fk9O4yOExqi7m_wY1C7g";
const LOCAL_STORAGE_KEY = 'fcm_token';

const NotificationIcon = () => {
    let token = "";
  const [notificationStatus, setNotificationStatus] = useState<string>('default');

  const fetchAndRegisterToken = async () => {
    try {
      if (!('Notification' in window) || !('serviceWorker' in navigator)) {
        setNotificationStatus('unsupported');
        return;
      }
      
      const messaging = getMessaging(app);
      const permission = await Notification.requestPermission();
      setNotificationStatus(permission);

      if (permission === 'granted') {
        const storedToken = localStorage.getItem(LOCAL_STORAGE_KEY);
        console.log(storedToken)
        const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
        console.log(currentToken)
        token = currentToken;
        if (currentToken) {
          if (currentToken !== storedToken) {
            console.log('New or updated FCM token found:', currentToken);
            localStorage.setItem(LOCAL_STORAGE_KEY, currentToken);

          } else {
            console.log('FCM token is already up-to-date.');
          }
        } else {
          console.log('No registration token available.');
          setNotificationStatus('denied');
        }
      }
    } catch (error) {
      console.error('An error occurred while retrieving token:', error);
      setNotificationStatus('error');
    }
  };

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationStatus(Notification.permission);
    }
  }, []);

  // Render a button or status based on permission
  const renderContent = () => {
    switch (notificationStatus) {
      case 'granted':
        return <p>✅ Notifications are enabled.</p>;
      case 'denied':
        return <p>❌ You have blocked notifications. Please enable them in your browser settings.</p>;
      case 'error':
        return <p>An error occurred. Please try again.</p>;
      case 'unsupported':
        return <p>This browser does not support notifications.</p>;
      default:
        return (
          <button onClick={fetchAndRegisterToken} style={{ padding: '10px', cursor: 'pointer' }}>
            {}
          </button>
        );
    }
  };

  return <div>{renderContent()}</div>;
};

export default NotificationIcon;