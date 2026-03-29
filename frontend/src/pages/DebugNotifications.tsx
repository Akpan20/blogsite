import { useEffect, useState } from 'react';

export default function DebugNotifications() {
  const [output, setOutput] = useState<string[]>([]);

  const log = (msg: string) => {
    console.log(msg);
    setOutput(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const testApiCall = async () => {
    log('🔍 Starting debug test...');
    
    // 1. Check token
    const token = localStorage.getItem('auth_token');
    log(`🔐 Token in storage: ${token ? '✅ YES' : '❌ NO'}`);
    if (token) log(`🔑 Token preview: ${token.substring(0, 30)}...`);

    // 2. Try direct fetch to backend (bypass axios config issues)
    const url = 'http://localhost:8000/api/notifications';
    log(`📡 Requesting: ${url}`);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          // Try BOTH formats below - comment/uncomment to test:
          'Authorization': `Bearer ${token}`,  // ← Standard JWT style
          // 'Authorization': token,            // ← Raw token style (Laravel custom?)
        },
        // If using cookie sessions instead of tokens:
        // credentials: 'include',
      });

      log(`📦 Status: ${response.status} ${response.statusText}`);
      log(`📦 Content-Type: ${response.headers.get('content-type')}`);

      const raw = await response.text();
      log(`📦 Raw response: ${raw.substring(0, 500)}`);

      if (response.ok) {
        const data = JSON.parse(raw);
        log(`✅ Success! Notifications count: ${Array.isArray(data) ? data.length : 'N/A'}`);
      } else {
        log(`❌ HTTP Error ${response.status}`);
        // Try to parse error message
        try {
          const err = JSON.parse(raw);
          log(`📛 Error details: ${JSON.stringify(err)}`);
        } catch {
          log(`📛 Raw error body: ${raw}`);
        }
      }
    } catch (error: any) {
      log(`💥 Network/JS Error: ${error.message}`);
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        log(`⚠️ Possible CORS issue or backend not running on port 8000`);
      }
    }
  };

  useEffect(() => {
    testApiCall();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
      <h2>🔧 Debug: Notifications API</h2>
      <button onClick={testApiCall} style={{ marginBottom: '10px', padding: '8px 16px' }}>
        🔁 Re-run Test
      </button>
      <div style={{ background: '#1e1e1e', color: '#0f0', padding: '10px', borderRadius: '4px' }}>
        {output.join('\n') || 'No logs yet...'}
      </div>
    </div>
  );
}