const KEY = 'low_data_mode';

/** A member's choice to leave out photos on a slow connection. */
export const isLowData = (): boolean => {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
};

export const setLowData = (on: boolean): void => {
  try {
    if (on) localStorage.setItem(KEY, '1');
    else localStorage.removeItem(KEY);
  } catch {
    // Private browsing can refuse storage. The site still works, with photos.
  }
};
