'use client';

import React, { useState, useRef } from 'react';

export default function TestUpload() {
  const [logs, setLogs] = useState<string[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
  };

  const handleClick = () => {
    addLog('Button clicked');
    if (fileInputRef.current) {
      addLog('File input found, clicking...');
      fileInputRef.current.click();
    } else {
      addLog('ERROR: File input ref is null');
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    addLog(`onChange triggered. Files: ${e.target.files?.length || 0}`);
    
    const file = e.target.files?.[0];
    if (!file) {
      addLog('No file selected');
      return;
    }

    addLog(`File: ${file.name}, Size: ${file.size}, Type: ${file.type}`);

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      addLog('File read complete');
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Try upload
    addLog('Starting upload...');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'profile');

      addLog('Sending request...');
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      addLog(`Response status: ${response.status}`);
      
      if (!response.ok) {
        const text = await response.text();
        addLog(`ERROR: ${text}`);
        return;
      }

      const data = await response.json();
      addLog(`Success! URL: ${data.url}`);
    } catch (err) {
      addLog(`ERROR: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Upload Test Page</h1>
      
      <div className="mb-6">
        <button 
          onClick={handleClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Select Image
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />
      </div>

      {preview && (
        <div className="mb-6">
          <p className="font-bold mb-2">Preview:</p>
          <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
        </div>
      )}

      <div className="bg-zinc-900 text-green-400 p-4 rounded-lg font-mono text-sm">
        <p className="font-bold text-white mb-2">Logs:</p>
        {logs.length === 0 ? (
          <p className="text-zinc-500">No logs yet. Click the button above.</p>
        ) : (
          logs.map((log, i) => <div key={i}>{log}</div>)
        )}
      </div>

      <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
        <p className="font-bold">Instructions:</p>
        <ol className="list-decimal ml-4 mt-2">
          <li>Click &quot;Select Image&quot; button</li>
          <li>Choose a photo from your device</li>
          <li>Watch the logs above</li>
          <li>If you see errors, screenshot this page</li>
        </ol>
      </div>
    </div>
  );
}
