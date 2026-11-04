import { useEffect, useState } from 'react';

export const useOnlineStatus = (): boolean => {
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));

  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, []);

  return online;
};

interface NetworkInformation extends EventTarget {
  effectiveType?: string;
  saveData?: boolean;
}

const readSlow = (): boolean => {
  const conn = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  return Boolean(conn && (conn.saveData || conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g'));
};

/**
 * True on a connection the browser reports as very slow, or when `pending` work has been running
 * longer than `afterMs`. Browsers without the Network Information API rely on the timer alone.
 */
export const useSlowNetwork = (pending = false, afterMs = 5000): boolean => {
  const [reportedSlow, setReportedSlow] = useState(() => (typeof navigator === 'undefined' ? false : readSlow()));
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const conn = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    if (!conn) return;
    const update = () => setReportedSlow(readSlow());
    conn.addEventListener('change', update);
    return () => conn.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    setTimedOut(false);
    if (!pending) return;
    const timer = setTimeout(() => setTimedOut(true), afterMs);
    return () => clearTimeout(timer);
  }, [pending, afterMs]);

  return reportedSlow || (pending && timedOut);
};
