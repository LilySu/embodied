import { useState, useEffect, useRef } from 'react';
import { Users, MapPin, MessageCircle, Send, Heart, ChevronLeft, UserPlus, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function computeTrajectoryScore(sessionObj) {
  if (!sessionObj) return 0;
  const keys = ['plankHold', 'singleLegL', 'singleLegR', 'energyLevel', 'wellbeing', 'bodyAwareness', 'movementConfidence'];
  let sum = 0;
  for (const k of keys) {
    const val = sessionObj[k] || 0;
    sum += val;
  }
  return Math.round(sum * 10) / 10;
}

function getTrajectoryData(mySessionData, otherSessionData) {
  const sessions = ['session1', 'session6', 'session12'];
  const labels = ['Session 1', 'Session 6', 'Session 12'];
  return sessions.map((s, i) => ({
    session: labels[i],
    You: computeTrajectoryScore(mySessionData?.[s]),
    Match: computeTrajectoryScore(otherSessionData?.[s]),
  }));
}

export default function CommunityView({ sessionData }) {
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [matches, setMatches] = useState([]);
  const [acceptedMatches, setAcceptedMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [subView, setSubView] = useState('overview');
  const [findingMatches, setFindingMatches] = useState(false);

  useEffect(() => {
    fetch('/api/auth/user', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        setAuthUser(data);
        setAuthLoading(false);
      })
      .catch(() => setAuthLoading(false));
  }, []);

  useEffect(() => {
    if (!authUser) return;
    setProfileLoading(true);
    Promise.all([
      fetch('/api/community/profile', { credentials: 'include' }).then(r => r.ok ? r.json() : null),
      fetch('/api/community/matches', { credentials: 'include' }).then(r => r.ok ? r.json() : []),
    ])
      .then(([profileData, matchesData]) => {
        setProfile(profileData);
        if (!profileData) setSubView('profile-setup');
        setAcceptedMatches(matchesData || []);
        setProfileLoading(false);
      })
      .catch(() => setProfileLoading(false));
  }, [authUser]);

  if (authLoading || profileLoading) {
    return (
      <div className="flex justify-center items-center py-20 animate-fadeInUp">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        <span className="ml-3 text-amber-700" style={{ fontFamily: 'Work Sans, sans-serif' }}>Loading...</span>
      </div>
    );
  }

  if (!authUser) {
    return <LoginPrompt />;
  }

  if (subView === 'profile-setup') {
    return (
      <ProfileSetup
        sessionData={sessionData}
        existingProfile={profile}
        onSaved={(p) => { setProfile(p); setSubView('overview'); }}
      />
    );
  }

  if (subView === 'chat' && selectedMatch) {
    return (
      <ChatView
        match={selectedMatch}
        authUser={authUser}
        onBack={() => { setSubView('overview'); setSelectedMatch(null); }}
      />
    );
  }

  return (
    <CommunityOverview
      profile={profile}
      sessionData={sessionData}
      matches={matches}
      setMatches={setMatches}
      acceptedMatches={acceptedMatches}
      setAcceptedMatches={setAcceptedMatches}
      findingMatches={findingMatches}
      setFindingMatches={setFindingMatches}
      onEditProfile={() => setSubView('profile-setup')}
      onOpenChat={(match) => { setSelectedMatch(match); setSubView('chat'); }}
    />
  );
}

function LoginPrompt() {
  return (
    <div className="flex justify-center py-16 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
      <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-10 border border-orange-200/50 max-w-md text-center card-hover">
        <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Users className="w-8 h-8 text-orange-600" />
        </div>
        <h2 className="text-2xl font-light text-amber-900 mb-3" style={{ fontFamily: 'Spectral, serif' }}>
          Join the Community
        </h2>
        <p className="text-amber-700 mb-6 font-light" style={{ fontFamily: 'Work Sans, sans-serif' }}>
          Connect with others on their longevity journey. Find practice partners near you and grow together.
        </p>
        <a
          href="/api/login"
          className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-all hover:scale-105"
          style={{ fontFamily: 'Work Sans, sans-serif' }}
        >
          <UserPlus className="w-5 h-5" />
          Sign In to Get Started
        </a>
      </div>
    </div>
  );
}

function ProfileSetup({ sessionData, existingProfile, onSaved }) {
  const [displayName, setDisplayName] = useState(existingProfile?.displayName || '');
  const [city, setCity] = useState(existingProfile?.city || '');
  const [bio, setBio] = useState(existingProfile?.bio || '');
  const [goals, setGoals] = useState(existingProfile?.goals || '');
  const [lat, setLat] = useState(existingProfile?.latitude || null);
  const [lon, setLon] = useState(existingProfile?.longitude || null);
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLon(pos.coords.longitude);
        setLocating(false);
      },
      () => {
        setError('Unable to get your location. Please enter your city manually.');
        setLocating(false);
      }
    );
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      setError('Please enter a display name');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/community/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ displayName, city, bio, goals, latitude: lat, longitude: lon, sessionData }),
      });
      if (!res.ok) throw new Error('Failed to save profile');
      const saved = await res.json();
      onSaved(saved);
    } catch {
      setError('Failed to save profile. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-8 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
      <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-orange-200/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-rose-100 rounded-2xl flex items-center justify-center">
            <UserPlus className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-xl font-light text-amber-900" style={{ fontFamily: 'Spectral, serif' }}>
              Set Up Your Profile
            </h2>
            <p className="text-sm text-amber-600" style={{ fontFamily: 'Work Sans, sans-serif' }}>
              Let others find you on their journey
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-amber-800 mb-1" style={{ fontFamily: 'Work Sans, sans-serif' }}>Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-orange-200/50 bg-white/60 text-amber-900 focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all"
              placeholder="Your name"
              style={{ fontFamily: 'Work Sans, sans-serif' }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-amber-800 mb-1" style={{ fontFamily: 'Work Sans, sans-serif' }}>City</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="flex-1 px-4 py-3 rounded-2xl border border-orange-200/50 bg-white/60 text-amber-900 focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all"
                placeholder="Your city"
                style={{ fontFamily: 'Work Sans, sans-serif' }}
              />
              <button
                onClick={handleLocation}
                disabled={locating}
                className="px-4 py-3 rounded-2xl bg-gradient-to-r from-orange-100 to-rose-100 text-orange-700 font-medium hover:from-orange-200 hover:to-rose-200 transition-all flex items-center gap-2 whitespace-nowrap"
                style={{ fontFamily: 'Work Sans, sans-serif' }}
              >
                {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                Use my location
              </button>
            </div>
            {lat && lon && (
              <p className="text-xs text-amber-500 mt-1" style={{ fontFamily: 'Work Sans, sans-serif' }}>
                📍 Coordinates: {lat.toFixed(4)}, {lon.toFixed(4)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-amber-800 mb-1" style={{ fontFamily: 'Work Sans, sans-serif' }}>Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-2xl border border-orange-200/50 bg-white/60 text-amber-900 focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all resize-none"
              placeholder="Tell others about your practice..."
              style={{ fontFamily: 'Work Sans, sans-serif' }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-amber-800 mb-1" style={{ fontFamily: 'Work Sans, sans-serif' }}>Goals</label>
            <textarea
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-2xl border border-orange-200/50 bg-white/60 text-amber-900 focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all resize-none"
              placeholder="What are your longevity goals?"
              style={{ fontFamily: 'Work Sans, sans-serif' }}
            />
          </div>

          {error && (
            <p className="text-sm text-rose-600" style={{ fontFamily: 'Work Sans, sans-serif' }}>{error}</p>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ fontFamily: 'Work Sans, sans-serif' }}
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Heart className="w-5 h-5" />}
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CommunityOverview({ profile, sessionData, matches, setMatches, acceptedMatches, setAcceptedMatches, findingMatches, setFindingMatches, onEditProfile, onOpenChat }) {
  const handleFindMatches = async () => {
    setFindingMatches(true);
    try {
      const res = await fetch('/api/community/find-matches', {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to find matches');
      const data = await res.json();
      const pending = (data || []).filter(m => m.status !== 'accepted');
      const accepted = (data || []).filter(m => m.status === 'accepted');
      setMatches(pending);
      setAcceptedMatches(accepted);
    } catch {
      setMatches([]);
    }
    setFindingMatches(false);
  };

  const handleAccept = async (matchId) => {
    try {
      const res = await fetch(`/api/community/matches/${matchId}/accept`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to accept');
      const updated = await res.json();
      const originalMatch = matches.find(m => (m.id || m.matchId) === matchId);
      const enriched = { ...updated, otherProfile: originalMatch?.otherProfile || originalMatch?.otherUser || null };
      setMatches(prev => prev.filter(m => (m.id || m.matchId) !== matchId));
      setAcceptedMatches(prev => [...prev, enriched]);
    } catch { /* silently fail */ }
  };

  return (
    <div className="space-y-6 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
      {profile && (
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-orange-200/50 card-hover">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-200 to-rose-200 rounded-2xl flex items-center justify-center">
                <Users className="w-7 h-7 text-orange-700" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-amber-900" style={{ fontFamily: 'Spectral, serif' }}>
                  {profile.displayName}
                </h3>
                {profile.city && (
                  <p className="text-sm text-amber-600 flex items-center gap-1" style={{ fontFamily: 'Work Sans, sans-serif' }}>
                    <MapPin className="w-3 h-3" /> {profile.city}
                  </p>
                )}
                {profile.bio && (
                  <p className="text-sm text-amber-700 mt-1" style={{ fontFamily: 'Work Sans, sans-serif' }}>{profile.bio}</p>
                )}
              </div>
            </div>
            <button
              onClick={onEditProfile}
              className="px-4 py-2 rounded-full text-sm bg-white/60 text-amber-700 hover:bg-white/80 transition-all font-medium"
              style={{ fontFamily: 'Work Sans, sans-serif' }}
            >
              Edit Profile
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <button
          onClick={handleFindMatches}
          disabled={findingMatches}
          className="px-8 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2 disabled:opacity-60"
          style={{ fontFamily: 'Work Sans, sans-serif' }}
        >
          {findingMatches ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
          {findingMatches ? 'Searching...' : 'Find Nearby Matches'}
        </button>
      </div>

      {matches.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-amber-900 text-center" style={{ fontFamily: 'Spectral, serif' }}>
            Potential Matches
          </h3>
          {matches.map((match) => (
            <MatchCard
              key={match.id || match.matchId}
              match={match}
              sessionData={sessionData}
              onAccept={() => handleAccept(match.id || match.matchId)}
            />
          ))}
        </div>
      )}

      {acceptedMatches.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-amber-900 text-center" style={{ fontFamily: 'Spectral, serif' }}>
            Your Connections
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {acceptedMatches.map((match) => (
              <div
                key={match.id || match.matchId}
                className="bg-white/70 backdrop-blur-sm rounded-3xl p-5 border border-orange-200/50 card-hover"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-rose-100 rounded-xl flex items-center justify-center">
                      <Heart className="w-5 h-5 text-rose-500" />
                    </div>
                    <div>
                      <p className="font-medium text-amber-900" style={{ fontFamily: 'Work Sans, sans-serif' }}>
                        {match.otherProfile?.displayName || match.otherUser?.displayName || match.displayName || 'Match'}
                      </p>
                      <p className="text-xs text-amber-600" style={{ fontFamily: 'Work Sans, sans-serif' }}>
                        {Math.round((match.similarityScore || 0) * 100)}% similar
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onOpenChat(match)}
                    className="px-4 py-2 rounded-full text-sm bg-gradient-to-r from-orange-500 to-rose-500 text-white font-medium hover:shadow-lg transition-all flex items-center gap-1"
                    style={{ fontFamily: 'Work Sans, sans-serif' }}
                  >
                    <MessageCircle className="w-4 h-4" /> Open Chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!findingMatches && matches.length === 0 && acceptedMatches.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-orange-400" />
          </div>
          <p className="text-amber-700 font-light" style={{ fontFamily: 'Work Sans, sans-serif' }}>
            Tap "Find Nearby Matches" to discover practice partners on a similar journey.
          </p>
        </div>
      )}
    </div>
  );
}

function MatchCard({ match, sessionData, onAccept }) {
  const otherUser = match.otherProfile || match.otherUser || match;
  const otherSessionData = otherUser.sessionData || null;
  const trajectoryData = getTrajectoryData(sessionData, otherSessionData);
  const similarityPercent = Math.round((match.similarityScore || 0) * 100);

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-orange-200/50 card-hover">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-200 to-rose-200 rounded-2xl flex items-center justify-center">
            <Users className="w-6 h-6 text-orange-700" />
          </div>
          <div>
            <h4 className="font-semibold text-amber-900" style={{ fontFamily: 'Work Sans, sans-serif' }}>
              {otherUser.displayName || 'Fellow Practitioner'}
            </h4>
            {otherUser.city && (
              <p className="text-sm text-amber-600 flex items-center gap-1" style={{ fontFamily: 'Work Sans, sans-serif' }}>
                <MapPin className="w-3 h-3" /> {otherUser.city}
              </p>
            )}
          </div>
        </div>
        <div className="text-right">
          {match.distance != null && (
            <p className="text-xs text-amber-500" style={{ fontFamily: 'Work Sans, sans-serif' }}>{Math.round(match.distance)} km away</p>
          )}
        </div>
      </div>

      {otherUser.bio && (
        <p className="text-sm text-amber-700 mb-4" style={{ fontFamily: 'Work Sans, sans-serif' }}>{otherUser.bio}</p>
      )}

      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-amber-700" style={{ fontFamily: 'Work Sans, sans-serif' }}>Similarity</span>
          <span className="text-xs font-semibold text-orange-600" style={{ fontFamily: 'Work Sans, sans-serif' }}>{similarityPercent}%</span>
        </div>
        <div className="w-full h-2 bg-orange-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full transition-all"
            style={{ width: `${similarityPercent}%` }}
          />
        </div>
      </div>

      {otherSessionData && (
        <div className="bg-white/50 rounded-2xl p-3 mb-4">
          <p className="text-xs font-medium text-amber-700 mb-2" style={{ fontFamily: 'Work Sans, sans-serif' }}>Trajectory Comparison</p>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={trajectoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" opacity={0.3} />
              <XAxis dataKey="session" stroke="#b45309" style={{ fontFamily: 'Work Sans, sans-serif', fontSize: '10px' }} />
              <YAxis stroke="#b45309" style={{ fontFamily: 'Work Sans, sans-serif', fontSize: '10px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #fed7aa',
                  borderRadius: '12px',
                  fontFamily: 'Work Sans, sans-serif',
                  fontSize: '12px',
                }}
              />
              <Line type="monotone" dataKey="You" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Match" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <button
        onClick={onAccept}
        className="w-full py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
        style={{ fontFamily: 'Work Sans, sans-serif' }}
      >
        <UserPlus className="w-5 h-5" /> Connect
      </button>
    </div>
  );
}

function ChatView({ match, authUser, onBack }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const matchId = match.id || match.matchId;
  const otherName = match.otherUser?.displayName || match.displayName || 'Match';
  const similarityPercent = Math.round((match.similarityScore || 0) * 100);

  const quickSuggestions = [
    "Let's grab lunch!",
    "Want to do a yoga session together?",
    "Coffee this week?",
  ];

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/community/matches/${matchId}/messages`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setMessages(data || []);
      }
    } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [matchId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text) => {
    const content = text || newMessage.trim();
    if (!content) return;
    setSending(true);
    try {
      await fetch(`/api/community/matches/${matchId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content }),
      });
      setNewMessage('');
      await fetchMessages();
    } catch { /* ignore */ }
    setSending(false);
  };

  const isOwnMessage = (msg) => {
    return msg.senderId === authUser?.id || msg.senderId === authUser?.userId;
  };

  return (
    <div className="max-w-2xl mx-auto animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
      <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-orange-200/50 overflow-hidden flex flex-col" style={{ height: '70vh' }}>
        <div className="p-4 border-b border-orange-200/30 flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-orange-100 transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-amber-700" />
          </button>
          <div className="w-10 h-10 bg-gradient-to-br from-orange-200 to-rose-200 rounded-xl flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-orange-700" />
          </div>
          <div>
            <p className="font-medium text-amber-900" style={{ fontFamily: 'Work Sans, sans-serif' }}>{otherName}</p>
            <p className="text-xs text-amber-600" style={{ fontFamily: 'Work Sans, sans-serif' }}>{similarityPercent}% similarity</p>
          </div>
        </div>

        <div className="px-4 py-2 border-b border-orange-200/20 flex gap-2 overflow-x-auto">
          {quickSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => handleSend(suggestion)}
              className="px-3 py-1.5 rounded-full text-xs bg-orange-50 text-orange-700 hover:bg-orange-100 transition-all whitespace-nowrap border border-orange-200/50"
              style={{ fontFamily: 'Work Sans, sans-serif' }}
            >
              {suggestion}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <MessageCircle className="w-10 h-10 text-orange-300 mx-auto mb-3" />
              <p className="text-amber-600 text-sm" style={{ fontFamily: 'Work Sans, sans-serif' }}>
                Start the conversation! Say hello or use a quick suggestion above.
              </p>
            </div>
          )}
          {messages.map((msg, i) => {
            const own = isOwnMessage(msg);
            return (
              <div key={msg.id || i} className={`flex ${own ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                    own
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                      : 'bg-white border border-orange-200/30 text-amber-900'
                  }`}
                >
                  <p className="text-sm" style={{ fontFamily: 'Work Sans, sans-serif' }}>{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${own ? 'text-amber-100' : 'text-amber-400'}`} style={{ fontFamily: 'Work Sans, sans-serif' }}>
                    {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-orange-200/30">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 rounded-2xl border border-orange-200/50 bg-white/60 text-amber-900 focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all"
              style={{ fontFamily: 'Work Sans, sans-serif' }}
            />
            <button
              onClick={() => handleSend()}
              disabled={sending || !newMessage.trim()}
              className="p-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-60"
            >
              {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
