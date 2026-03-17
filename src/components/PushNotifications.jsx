import { useState, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

export default function PushNotifications() {
  const [enabled, setEnabled] = useLocalStorage('pulsenews-push', false);
  const [permission, setPermission] = useState('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const toggle = async () => {
    if (!('Notification' in window)) return;

    if (!enabled) {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') {
        setEnabled(true);
        new Notification('PulseNews', {
          body: 'Breaking news notifications are now enabled!',
          icon: '/favicon.svg',
        });
      }
    } else {
      setEnabled(false);
    }
  };

  if (!('Notification' in window)) return null;

  return (
    <div className="flex items-center justify-between p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${enabled ? 'bg-[#fef0ed] dark:bg-[#e87461]/10' : 'bg-[var(--bg)]'}`}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className={enabled ? 'text-[#e05d44] dark:text-[#e87461]' : 'text-[var(--text-muted)]'}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--text)]">Push Notifications</p>
          <p className="text-[11px] text-[var(--text-muted)]">
            {permission === 'denied' ? 'Blocked by browser' : enabled ? 'Breaking news alerts on' : 'Get notified of breaking news'}
          </p>
        </div>
      </div>
      <button
        onClick={toggle}
        disabled={permission === 'denied'}
        className={`w-11 h-6 rounded-full transition-colors relative ${
          enabled ? 'bg-[#e05d44] dark:bg-[#e87461]' : 'bg-[var(--border)]'
        } disabled:opacity-40`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
            enabled ? 'left-[22px]' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  );
}
