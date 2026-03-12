import { useEffect, useRef } from 'react';

export function useFilePolling(fetchFiles, intervalMs = 15000) {
  const callbackRef = useRef(fetchFiles);
  callbackRef.current = fetchFiles;

  useEffect(() => {
    let timer;

    function poll() {
      if (document.visibilityState === 'visible') {
        callbackRef.current(false);
      }
    }

    function startPolling() {
      timer = setInterval(poll, intervalMs);
    }

    function handleVisibility() {
      clearInterval(timer);
      if (document.visibilityState === 'visible') {
        callbackRef.current(false);
        startPolling();
      }
    }

    startPolling();
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [intervalMs]);
}
