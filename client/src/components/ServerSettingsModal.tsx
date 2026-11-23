import React, { useState, useEffect } from 'react';
import { X, Server, Check, Wifi, Globe, Laptop, RefreshCw, AlertCircle } from 'lucide-react';
import { socketService } from '../services/socket';

interface ServerSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESETS = [
  {
    name: 'Home Wi-Fi (Same Network)',
    url: 'http://10.92.131.244:4000',
    icon: Wifi,
    description: 'Use when your phone is connected to the same Wi-Fi'
  },
  {
    name: 'Public Cloud Tunnel',
    url: 'https://guessthe11-server.loca.lt',
    icon: Globe,
    description: 'Use on Mobile Data (4G/5G) or outside home'
  },
  {
    name: 'Localhost (This PC)',
    url: 'http://localhost:4000',
    icon: Laptop,
    description: 'For testing directly on developer PC'
  }
];

export const ServerSettingsModal: React.FC<ServerSettingsModalProps> = ({ isOpen, onClose }) => {
  const [currentUrl, setCurrentUrl] = useState<string>(socketService.getServerUrl());
  const [inputUrl, setInputUrl] = useState<string>(socketService.getServerUrl());
  const [isConnected, setIsConnected] = useState<boolean>(socketService.isConnected());
  const [testStatus, setTestStatus] = useState<{ testing: boolean; success?: boolean; message?: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const activeUrl = socketService.getServerUrl();
      setCurrentUrl(activeUrl);
      setInputUrl(activeUrl);
      setIsConnected(socketService.isConnected());
      setTestStatus(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Test Server Connection
  const handleTestConnection = async (targetUrl?: string) => {
    const urlToTest = (targetUrl || inputUrl).trim().replace(/\/+$/, '');
    if (!urlToTest) return;

    setTestStatus({ testing: true });
    const startTime = Date.now();

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`${urlToTest}/health`, {
        signal: controller.signal,
        headers: { 'Bypass-Tunnel-Reminder': 'true' }
      });
      clearTimeout(timer);

      if (res.ok) {
        const ping = Date.now() - startTime;
        setTestStatus({
          testing: false,
          success: true,
          message: `Connected successfully! (Ping: ${ping}ms)`
        });
      } else {
        setTestStatus({
          testing: false,
          success: false,
          message: `Server returned HTTP ${res.status}`
        });
      }
    } catch (err: any) {
      setTestStatus({
        testing: false,
        success: false,
        message: err.name === 'AbortError' ? 'Connection timed out (4s)' : 'Cannot reach server at this address'
      });
    }
  };

  // Save and connect
  const handleSave = () => {
    const clean = inputUrl.trim().replace(/\/+$/, '');
    if (!clean) return;

    socketService.setServerUrl(clean);
    setCurrentUrl(clean);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col font-sans">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400 text-slate-950 shadow-sm">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-game tracking-wide text-white">
                SERVER SETTINGS
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                <span className="text-[11px] font-sans text-slate-400">
                  {isConnected ? 'Server Online' : 'Server Offline'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 py-4">
          {/* Quick Preset Buttons */}
          <div>
            <label className="block text-xs font-game font-semibold text-slate-300 mb-2 uppercase">
              Quick Connect Presets
            </label>
            <div className="space-y-2">
              {PRESETS.map((preset) => {
                const IconComponent = preset.icon;
                const isSelected = inputUrl === preset.url;

                return (
                  <button
                    key={preset.url}
                    type="button"
                    onClick={() => {
                      setInputUrl(preset.url);
                      handleTestConnection(preset.url);
                    }}
                    className={`w-full p-3 rounded-2xl border-2 text-left transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-amber-400/15 border-amber-400 shadow-md'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${isSelected ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-game font-bold text-white">{preset.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{preset.url}</p>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Server URL Input */}
          <div>
            <label className="block text-xs font-game font-semibold text-slate-300 mb-1.5 uppercase">
              Custom Server Address
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => {
                  setInputUrl(e.target.value);
                  setTestStatus(null);
                }}
                placeholder="http://10.92.131.244:4000"
                className="flex-1 bg-slate-950 border-2 border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-amber-400 font-sans"
              />
              <button
                type="button"
                onClick={() => handleTestConnection()}
                disabled={testStatus?.testing}
                className="px-3 py-2 rounded-xl bg-slate-800 border-2 border-slate-700 hover:border-slate-500 text-slate-200 text-xs font-game font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testStatus?.testing ? 'animate-spin' : ''}`} />
                Test
              </button>
            </div>
          </div>

          {/* Test Status Feedback */}
          {testStatus && !testStatus.testing && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                testStatus.success
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}
            >
              {testStatus.success ? (
                <Check className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              )}
              <span>{testStatus.message}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl btn-3d-slate text-xs uppercase tracking-wide cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 py-3 rounded-2xl btn-3d-amber text-xs uppercase tracking-wide cursor-pointer"
            >
              Save & Connect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
