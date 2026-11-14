// src/hooks/usePageActivity.js

import { useEffect, useRef } from 'react';

const usePageActivity = () => {
  const isPageActive = useRef(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        isPageActive.current = true;
        console.log('Page is active.');
      } else {
        isPageActive.current = false;
        console.log('Page is inactive.');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    console.log('Visibility change listener added.');

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      console.log('Visibility change listener removed.');
    };
  }, []);

  return isPageActive;
};

export default usePageActivity;
