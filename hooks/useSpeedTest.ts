import { useState, useCallback, useRef } from 'react';

interface SpeedTestResults {
  ping: number | null;
  jitter: number | null;
  download: number | null;
  upload: number | null;
}

interface Server {
  id: number;
  url: string;
  name: string;
}

export type TestStatus = 'idle' | 'pinging' | 'downloading' | 'uploading' | 'completed';

export function useSpeedTest() {
  const [status, setStatus] = useState<TestStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(0); // Mbps
  const [results, setResults] = useState<SpeedTestResults>({
    ping: null,
    jitter: null,
    download: null,
    upload: null,
  });
  const [error, setError] = useState<string | null>(null);

  const abortController = useRef<AbortController | null>(null);

  const reset = () => {
    setStatus('idle');
    setProgress(0);
    setCurrentSpeed(0);
    setResults({ ping: null, jitter: null, download: null, upload: null });
    setError(null);
  };

  const startTest = useCallback(async (server: Server) => {
    reset();
    setStatus('pinging');
    abortController.current = new AbortController();
    const signal = abortController.current.signal;

    try {
      // --- PING PHASE (Enhanced Jitter & Latency) ---
      const pings: number[] = [];
      const pingCount = 10; // Increase sample size for better jitter accuracy

      // Using static file for lowest latency (bypass Next.js API routing overhead)
      const pingTarget = '/ping.txt'; 

      for (let i = 0; i < pingCount; i++) {
        if (signal.aborted) return;
        
        // Add random timestamp to bypass browser cache strictly
        const targetWithCacheBuster = `${pingTarget}?t=${Date.now()}-${i}`;
        
        const start = performance.now();
        try {
          await fetch(targetWithCacheBuster, { 
            method: 'HEAD', 
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }, // Extra headers
            signal 
          });
        } catch (e) {
          console.warn("Ping failed", e);
        }
        const end = performance.now();
        const duration = end - start;
        
        // Filter extremely low values (likely cache hit or timer precision error)
        // But allow > 0.5ms as valid on fast fiber/localhost
        if (duration > 0.1) {
           pings.push(duration);
        }
        
        setProgress((i + 1) / pingCount * 10); 
        await new Promise(r => setTimeout(r, 50)); // short cool down
      }

      if (pings.length === 0) {
         // Fallback if all pings failed or were filtered
         setResults(prev => ({ ...prev, ping: 0, jitter: 0 }));
      } else {
         const minPing = Math.min(...pings);
         const avgPing = pings.reduce((a, b) => a + b, 0) / pings.length;
         // Use Average Ping for more realistic display, or Min Ping if preferred (Speedtest.net uses Min usually, but let's ensure it's not 0)
         
         // Jitter: Average of the absolute deviation from mean
         const jitter = pings.reduce((acc, val) => acc + Math.abs(val - avgPing), 0) / pings.length;

         setResults(prev => ({ ...prev, ping: Math.round(minPing), jitter: Math.round(jitter) })); // Round values
      }


      // --- DOWNLOAD PHASE (Parallel Streams) ---
      setStatus('downloading');
      const downloadDurationLimit = 10000; // 10 seconds
      const downloadStart = performance.now();
      
      // Use 4 parallel streams to saturate bandwidth
      const streamCount = 4;
      let totalBytesLoaded = 0;
      let activeStreams = 0;
      let isDownloadActive = true;
      
      // Shared state for all streams
      const streamControllers: AbortController[] = [];

      // Timer to stop download
      const downloadTimer = setTimeout(() => {
        isDownloadActive = false;
        streamControllers.forEach(c => c.abort());
      }, downloadDurationLimit);

      const downloadStream = async (index: number) => {
        while (isDownloadActive) {
          if (signal.aborted) break;
          const controller = new AbortController();
          streamControllers.push(controller);
          
          try {
            const response = await fetch(`/api/test/download?t=${Date.now()}&s=${index}`, { 
              signal: controller.signal 
            });
            
            const reader = response.body?.getReader();
            if (!reader) break;
            
            while (true) {
              const { done, value } = await reader.read();
              if (done || !isDownloadActive || signal.aborted) break;
              if (value) {
                 totalBytesLoaded += value.length;
              }
            }
          } catch (e) {
            // Ignore abort errors
          }
        }
      };

      // Start update loop for UI
      const uiInterval = setInterval(() => {
         if (!isDownloadActive || signal.aborted) {
             clearInterval(uiInterval);
             return;
         }
         const now = performance.now();
         const durationSec = (now - downloadStart) / 1000;
         
         if (durationSec > 0.1) { // Avoid divide by zero
            // Calculate instantaneous speed
            const speedMbps = (totalBytesLoaded * 8 / durationSec) / 1_000_000;
            setCurrentSpeed(speedMbps);
            
            const timeProgress = Math.min(durationSec / (downloadDurationLimit / 1000), 1);
            setProgress(10 + (timeProgress * 40)); // 10% to 50%
         }
      }, 100);

      // Run streams in parallel
      await Promise.all(Array.from({ length: streamCount }).map((_, i) => downloadStream(i)));
      
      clearTimeout(downloadTimer);
      clearInterval(uiInterval);

      const finalDownloadDuration = (performance.now() - downloadStart) / 1000;
      const finalDownloadSpeed = (totalBytesLoaded * 8 / finalDownloadDuration) / 1_000_000;
      setResults(prev => ({ ...prev, download: finalDownloadSpeed }));
      setCurrentSpeed(0);

      // --- DELAY PHASE (2 Seconds Cooldown) ---
      await new Promise(r => setTimeout(r, 2000));

      // --- UPLOAD PHASE (Parallel XHR) ---
      setStatus('uploading');
      const uploadDurationLimit = 10000; 
      const uploadStart = performance.now();
      let totalUploadedBytes = 0;
      let isUploadActive = true;
      
      // 20MB chunk
      const chunkSize = 20 * 1024 * 1024;
      const blob = new Blob([new ArrayBuffer(chunkSize)]); 

      const uploadTimer = setTimeout(() => {
        isUploadActive = false;
      }, uploadDurationLimit);

      // Track bytes per stream
      const streamBytes = new Array(streamCount).fill(0);

      const uploadStream = async (index: number) => {
         while (isUploadActive) {
            if (signal.aborted) break;
            
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `/api/test/upload?t=${Date.now()}&s=${index}`, true);
            
            await new Promise<void>((resolve, reject) => {
                let lastLoaded = 0;
                xhr.upload.onprogress = (event) => {
                    if (!isUploadActive || signal.aborted) {
                        xhr.abort();
                        reject();
                        return;
                    }
                    const diff = event.loaded - lastLoaded;
                    lastLoaded = event.loaded;
                    streamBytes[index] += diff; // Update this stream's total
                };
                xhr.onload = () => resolve();
                xhr.onerror = () => resolve(); // Retry on error
                xhr.onabort = () => reject();
                xhr.send(blob);
            }).catch(() => {});
         }
      };
      
      // UI Update loop for Upload
      const uploadUiInterval = setInterval(() => {
         if (!isUploadActive || signal.aborted) {
             clearInterval(uploadUiInterval);
             return;
         }
         
         // Sum all bytes from all streams
         const currentTotal = streamBytes.reduce((a, b) => a + b, 0);
         const now = performance.now();
         const durationSec = (now - uploadStart) / 1000;
         
         if (durationSec > 0.1) {
            const speedMbps = (currentTotal * 8 / durationSec) / 1_000_000;
            setCurrentSpeed(speedMbps);
            
            const timeProgress = Math.min(durationSec / (uploadDurationLimit / 1000), 1);
            setProgress(50 + (timeProgress * 50)); // 50% to 100%
         }
      }, 100);

      await Promise.all(Array.from({ length: streamCount }).map((_, i) => uploadStream(i)));

      clearTimeout(uploadTimer);
      clearInterval(uploadUiInterval);
      
      const finalTotalUpload = streamBytes.reduce((a, b) => a + b, 0);
      const finalUploadDuration = (performance.now() - uploadStart) / 1000;
      const finalUploadSpeed = (finalTotalUpload * 8 / finalUploadDuration) / 1_000_000;
      setResults(prev => ({ ...prev, upload: finalUploadSpeed }));

      // --- FINISH ---
      setStatus('completed');
      setProgress(100);
      setCurrentSpeed(0);

    } catch (e: any) {
      if (e.name === 'AbortError') return;
      console.error(e);
      setError('Terjadi kesalahan saat melakukan tes.');
      setStatus('idle');
    }
  }, []);

  return {
    status,
    progress,
    currentSpeed,
    results,
    error,
    startTest,
    reset
  };
}
