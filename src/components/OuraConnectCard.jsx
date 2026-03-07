import { useEffect, useMemo, useState } from 'react';
import { Link2, RefreshCcw, Moon, HeartPulse, Footprints } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

function formatDurationSeconds(seconds) {
  if (!seconds && seconds !== 0) return 'n/a';
  const totalMinutes = Math.round(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

async function fetchJson(path) {
  const response = await fetch(`${API_BASE_URL}${path}`);
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error || `Request failed (${response.status})`);
  }
  return payload;
}

export default function OuraConnectCard() {
  const [connected, setConnected] = useState(false);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const metrics = useMemo(() => {
    return [
      {
        icon: <Moon className="w-4 h-4 text-indigo-500" />,
        label: 'Sleep Score',
        value: summary?.latest?.sleep?.score ?? 'n/a',
      },
      {
        icon: <HeartPulse className="w-4 h-4 text-rose-500" />,
        label: 'Readiness Score',
        value: summary?.latest?.readiness?.score ?? 'n/a',
      },
      {
        icon: <Footprints className="w-4 h-4 text-amber-500" />,
        label: 'Steps',
        value: summary?.latest?.activity?.steps ?? 'n/a',
      },
    ];
  }, [summary]);

  const loadStatusAndData = async () => {
    setLoading(true);
    setError('');
    try {
      const status = await fetchJson('/api/oura/status');
      setConnected(Boolean(status.connected));

      if (status.connected) {
        const nextSummary = await fetchJson('/api/oura/summary?days=7');
        setSummary(nextSummary);
      } else {
        setSummary(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load Oura data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ouraState = params.get('oura');
    const ouraMessage = params.get('message');

    if (ouraState === 'connected') {
      setStatusMessage('Oura connected successfully.');
    } else if (ouraState === 'error') {
      setStatusMessage(`Oura connection failed${ouraMessage ? `: ${ouraMessage}` : '.'}`);
    }

    if (ouraState) {
      params.delete('oura');
      params.delete('message');
      const next = params.toString();
      window.history.replaceState({}, '', `${window.location.pathname}${next ? `?${next}` : ''}`);
    }

    loadStatusAndData();
  }, []);

  const handleConnect = () => {
    window.location.href = `${API_BASE_URL}/auth/oura/start`;
  };

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-orange-200/50 card-hover animate-fadeInUp" style={{animationDelay: '0.68s'}}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-amber-900 mb-1" style={{fontFamily: 'Spectral, serif'}}>
            Oura Integration
          </h3>
          <p className="text-sm text-amber-700" style={{fontFamily: 'Work Sans, sans-serif'}}>
            Connect your Oura account to pull readiness, sleep, and activity.
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${connected ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
          {connected ? 'Connected' : 'Not Connected'}
        </div>
      </div>

      {statusMessage && (
        <p className="text-sm mt-3 text-amber-800" style={{fontFamily: 'Work Sans, sans-serif'}}>
          {statusMessage}
        </p>
      )}

      {error && (
        <p className="text-sm mt-3 text-rose-700" style={{fontFamily: 'Work Sans, sans-serif'}}>
          {error}
        </p>
      )}

      {connected && summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-orange-100/70">
              <div className="flex items-center gap-2 mb-1">
                {metric.icon}
                <p className="text-xs text-amber-700 uppercase tracking-wide" style={{fontFamily: 'Work Sans, sans-serif'}}>
                  {metric.label}
                </p>
              </div>
              <p className="text-2xl text-amber-900 font-light" style={{fontFamily: 'Spectral, serif'}}>
                {metric.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {connected && summary?.latest?.sleep && (
        <p className="text-sm text-amber-700 mt-3" style={{fontFamily: 'Work Sans, sans-serif'}}>
          Last sleep: {summary.latest.sleep.date} ({formatDurationSeconds(summary.latest.sleep.totalSleepDuration)})
        </p>
      )}

      <div className="flex gap-3 mt-4">
        <button
          onClick={connected ? loadStatusAndData : handleConnect}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 text-white text-sm font-medium hover:shadow-lg transition-all disabled:opacity-60"
          style={{fontFamily: 'Work Sans, sans-serif'}}
        >
          {connected ? <RefreshCcw className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
          {loading ? 'Loading...' : connected ? 'Refresh Oura Data' : 'Connect Oura'}
        </button>
      </div>
    </div>
  );
}
