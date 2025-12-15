import { useEffect } from 'react';
import { requestNotificationPermissions } from '@/utils/notifications';

/**
 * Component to set up notification permissions on app start
 * This should be added to the root layout
 */
export default function NotificationSetup() {
  useEffect(() => {
    // Request notification permissions when app starts
    requestNotificationPermissions().then((granted) => {
      if (granted) {
        console.log('Notification permissions granted');
      } else {
        console.log('Notification permissions denied');
      }
    });
  }, []);

  return null;
}

