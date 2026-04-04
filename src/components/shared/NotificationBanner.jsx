import { useState, useEffect } from 'react';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
} from '../../lib/notifications';

export default function NotificationBanner() {
  const [visible, setVisible] = useState(false);
  const [permission, setPermission] = useState('default');

  useEffect(() => {
    if (!isNotificationSupported()) return;

    const perm = getNotificationPermission();
    setPermission(perm);

    // Show banner if permission not yet requested and not dismissed in this session
    const dismissed = sessionStorage.getItem('notif-banner-dismissed');
    if (perm === 'default' && !dismissed) {
      // Delay showing to not interrupt initial load
      const timer = setTimeout(() => setVisible(true), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  async function handleEnable() {
    const result = await requestNotificationPermission();
    setPermission(result);
    if (result === 'granted') {
      setVisible(false);
    }
  }

  function handleDismiss() {
    setVisible(false);
    sessionStorage.setItem('notif-banner-dismissed', 'true');
  }

  if (!visible) return null;

  return (
    <div className="bg-bg-card border border-border rounded-xl p-4 flex items-start gap-3 mb-4">
      <span className="text-xl">{'\u{1F514}'}</span>
      <div className="flex-1">
        <h3 className="text-text-primary text-sm md:text-base font-semibold">Enable Notifications?</h3>
        <p className="text-text-muted text-sm mt-0.5">
          Get weekly Sunday recap summaries and milestone progress alerts.
        </p>
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleEnable}
            className="text-sm px-3 py-1.5 rounded-lg text-white font-medium"
            style={{ background: 'linear-gradient(135deg, #f97316, #0ea5e9)' }}
          >
            Enable Notifications
          </button>
          <button
            onClick={handleDismiss}
            className="text-sm px-3 py-1.5 rounded-lg border border-border text-text-dim hover:text-text-muted"
          >
            Not Now
          </button>
        </div>
      </div>
    </div>
  );
}
