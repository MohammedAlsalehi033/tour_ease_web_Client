'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getMessaging, getToken } from 'firebase/messaging';
import { app } from '@/lib/firebase';
import { ApiService } from '@/app/services/apiService';

const VAPID_KEY = "BNZH892p7b9hWzbPsIxBiHF78ZZzuHSDnVtDKpVeSrKe-GIloLjQ7xwWW-mxIjyhPC2Fk9O4yOExqi7m_wY1C7g";
const LOCAL_STORAGE_KEY = 'fcm_token';

const apiService = new ApiService();

const NotificationIcon = () => {
  const { data: sessionData, status: sessionStatus } = useSession();

  useEffect(() => {
    if (sessionStatus !== 'authenticated' || !sessionData?.user?.id) {
      return;
    }
    
    const userId = sessionData.user.id;

    const initializeAndRegisterFCM = async () => {
      try {
        if (!('Notification' in window) || !('serviceWorker' in navigator)) {
          return;
        }

        const messaging = getMessaging(app);
        const permission = await Notification.requestPermission();

        if (permission === 'granted') {
          const storedToken = localStorage.getItem(LOCAL_STORAGE_KEY);
          const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });

          if (currentToken && currentToken !== storedToken) {
            localStorage.setItem(LOCAL_STORAGE_KEY, currentToken);
            await apiService.post(`/FCMToken/${userId}`, { fcmToken: currentToken });
          }
        }
      } catch (error) {
        console.error('An error occurred during FCM initialization:', error);
      }
    };

    initializeAndRegisterFCM();

  }, [sessionStatus, sessionData]);

  return null;
};

export default NotificationIcon;