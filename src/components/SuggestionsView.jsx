import { useState } from 'react';
import { Leaf, Calendar, Heart, Sprout, Sparkles, MapPin, ChevronDown, ChevronUp, Navigation2, Clock } from 'lucide-react';
import { suggestions } from '../data/suggestions';

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || '';

const LOCATION_COORDS = {
  'Community Center': { lat: 37.7749, lng: -122.4194, address: '123 Main St, San Francisco, CA' },
  'Wellness Studio': { lat: 37.7850, lng: -122.4090, address: '456 Valencia St, San Francisco, CA' },
  'Riverside Park': { lat: 37.7694, lng: -122.4862, address: 'Golden Gate Park, San Francisco, CA' },
};

const BACKUP_LOCATIONS = [
  { name: 'Parkside Pilates', distance: '0.8 miles away', lat: 37.7720, lng: -122.4250, time: '12 min walk' },
  { name: 'Core Yoga Hub', distance: '1.2 miles away', lat: 37.7800, lng: -122.4100, time: '5 min drive' },
];

const BIOMARKER_ALERTS = [
  {
    label: 'Grip Strength',
    dropPercent: 10,
    emoji: '🤲',
    exercise: 'Downward Facing Dog',
    description: 'Holding this pose rebuilds the hand-to-floor connection and strengthens your grip endurance.',
    gradient: 'from-rose-100/90 to-orange-50/90',
    accent: 'rose',
  },
  {
    label: 'Core Stability',
    dropPercent: 5,
    emoji: '🧘',
    exercise: 'Hold a Plank',
    prescription: 'Aim for at least 15 seconds, 4 times a week.',
    description: 'Rebuilding your plank hold restores the deep core engagement needed for every movement you do.',
    gradient: 'from-amber-100/90 to-orange-50/90',
    accent: 'amber',
  },
  {
    label: 'Balance & Symmetry',
    dropPercent: 5,
    emoji: '🌳',
    exercise: 'Tree Pose (L)',
    description: 'Practicing a static balance pose helps recalibrate your stability and weight distribution.',
    gradient: 'from-orange-100/90 to-amber-50/90',
    accent: 'orange',
  },
];

const ACCENT_STYLES = {
  rose: {
    badge: 'bg-rose-200/70 text-rose-700',
    border: 'border-rose-200/60',
    heading: 'text-rose-800',
    tag: 'text-rose-600',
  },
  amber: {
    badge: 'bg-amber-200/70 text-amber-700',
    border: 'border-amber-200/60',
    heading: 'text-amber-800',
    tag: 'text-amber-600',
  },
  orange: {
    badge: 'bg-orange-200/70 text-orange-700',
    border: 'border-orange-200/60',
    heading: 'text-orange-800',
    tag: 'text-orange-600',
  },
};

function AlertCard({ alert, index }) {
  const s = ACCENT_STYLES[alert.accent];

  return (
    <div
      className={`bg-gradient-to-br ${alert.gradient} rounded-3xl p-6 border ${s.border} animate-alertPulse card-hover animate-fadeInUp`}
      style={{ animationDelay: `${0.15 + index * 0.12}s` }}
    >
      <div className="flex items-start gap-5">
        <div className="text-4xl flex-shrink-0 pt-1">{alert.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`text-sm uppercase tracking-widest font-semibold ${s.tag}`} style={{ fontFamily: 'Work Sans, sans-serif' }}>
              {alert.label}
            </span>
            <span className={`text-sm ${s.badge} px-3 py-1 rounded-full font-semibold`} style={{ fontFamily: 'Work Sans, sans-serif' }}>
              ↓ {alert.dropPercent}% this month
            </span>
          </div>
          <h4 className={`text-xl md:text-2xl font-semibold ${s.heading} mb-1`} style={{ fontFamily: 'Spectral, serif' }}>
            {alert.exercise}
          </h4>
          {alert.prescription && (
            <p className="text-base font-medium text-amber-800 mb-1.5" style={{ fontFamily: 'Work Sans, sans-serif' }}>
              {alert.prescription}
            </p>
          )}
          <p className="text-base text-amber-700/90 leading-relaxed" style={{ fontFamily: 'Work Sans, sans-serif' }}>
            {alert.description}
          </p>
        </div>
      </div>
    </div>
  );
}

function RouteMapPreview({ location }) {
  const coords = LOCATION_COORDS[location] || LOCATION_COORDS['Community Center'];
  const mapSrc = GOOGLE_MAPS_KEY
    ? `https://www.google.com/maps/embed/v1/directions?key=${GOOGLE_MAPS_KEY}&origin=Current+Location,${coords.lat - 0.008},${coords.lng + 0.005}&destination=${coords.lat},${coords.lng}&mode=walking&zoom=14`
    : '';

  return (
    <div className="mt-5 animate-fadeInUp">
      <div className="flex items-center gap-2 mb-3">
        <Navigation2 className="w-4 h-4 text-orange-500" />
        <span className="text-sm font-semibold text-amber-800 uppercase tracking-wider" style={{ fontFamily: 'Work Sans, sans-serif' }}>
          Live Route Preview
        </span>
      </div>
      <div className="relative rounded-2xl overflow-hidden border border-orange-200/60 shadow-sm">
        {GOOGLE_MAPS_KEY ? (
          <iframe
            src={mapSrc}
            className="w-full h-48 md:h-56"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Route to activity location"
          />
        ) : (
          <div className="w-full h-48 md:h-56 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
            <p className="text-amber-700 text-sm" style={{ fontFamily: 'Work Sans, sans-serif' }}>Map preview unavailable</p>
          </div>
        )}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-orange-200/40 flex items-center gap-2">
          <Clock className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-semibold text-amber-800" style={{ fontFamily: 'Work Sans, sans-serif' }}>
            10 min walk
          </span>
        </div>
      </div>
      <p className="text-sm text-amber-600 mt-2 flex items-center gap-1.5" style={{ fontFamily: 'Work Sans, sans-serif' }}>
        <MapPin className="w-3.5 h-3.5" />
        {coords.address}
      </p>
    </div>
  );
}

function BackupLocationsSection() {
  const center = LOCATION_COORDS['Community Center'];
  const markersParam = BACKUP_LOCATIONS.map((loc, i) =>
    `&markers=color:red%7Clabel:${String.fromCharCode(65 + i)}%7C${loc.lat},${loc.lng}`
  ).join('');
  const mapSrc = GOOGLE_MAPS_KEY
    ? `https://www.google.com/maps/embed/v1/view?key=${GOOGLE_MAPS_KEY}&center=${center.lat},${center.lng}&zoom=13`
    : '';

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-amber-200/50 card-hover animate-fadeInUp" style={{ animationDelay: '0.75s' }}>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center flex-shrink-0">
          <MapPin className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-amber-900" style={{ fontFamily: 'Spectral, serif' }}>
          Nearby Alternatives
        </h3>
      </div>

      <div className="relative rounded-2xl overflow-hidden border border-amber-200/50 shadow-sm mb-5">
        {GOOGLE_MAPS_KEY ? (
          <iframe
            src={mapSrc}
            className="w-full h-40 md:h-48"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Nearby alternative locations"
          />
        ) : (
          <div className="w-full h-40 md:h-48 bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
            <p className="text-amber-700 text-sm" style={{ fontFamily: 'Work Sans, sans-serif' }}>Map preview unavailable</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {BACKUP_LOCATIONS.map((loc) => (
          <div key={loc.name} className="bg-gradient-to-br from-amber-50/80 to-orange-50/80 rounded-2xl p-4 border border-amber-200/40 flex items-start gap-3">
            <div className="w-9 h-9 bg-white/80 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
              <MapPin className="w-4 h-4 text-orange-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-base font-semibold text-amber-900 mb-0.5" style={{ fontFamily: 'Spectral, serif' }}>
                {loc.name}
              </h4>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-amber-600" style={{ fontFamily: 'Work Sans, sans-serif' }}>
                  {loc.distance}
                </span>
                <span className="text-xs bg-orange-200/60 text-orange-700 px-2 py-0.5 rounded-full font-medium" style={{ fontFamily: 'Work Sans, sans-serif' }}>
                  {loc.time}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SuggestionsView({ currentDay, setCurrentDay, sessionData }) {
  const [showMap, setShowMap] = useState(false);
  const activity = suggestions[currentDay].activity;

  return (
    <div className="space-y-6">
      <div className="space-y-4 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
        <h3 className="text-sm uppercase tracking-widest text-rose-600 font-semibold px-1" style={{ fontFamily: 'Work Sans, sans-serif' }}>
          Your Body This Month
        </h3>
        {BIOMARKER_ALERTS.map((alert, i) => (
          <AlertCard key={alert.label} alert={alert} index={i} />
        ))}
      </div>

      <div className="flex justify-center gap-3 mb-6 animate-fadeInUp" style={{animationDelay: '0.5s'}}>
        {[
          { key: 'day1', label: 'Today' },
          { key: 'day2', label: 'Tomorrow' },
          { key: 'day3', label: 'Day After' },
        ].map(day => (
          <button
            key={day.key}
            onClick={() => setCurrentDay(day.key)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
              currentDay === day.key
                ? 'bg-amber-600 text-white shadow-lg'
                : 'bg-white/60 text-amber-700 hover:bg-white/80'
            }`}
            style={{fontFamily: 'Work Sans, sans-serif'}}
          >
            {day.label}
          </button>
        ))}
      </div>

      <div className="bg-gradient-to-br from-rose-100/80 to-orange-100/80 rounded-3xl p-8 border border-rose-200/50 card-hover animate-fadeInUp" style={{animationDelay: '0.6s'}}>
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-white/80 rounded-2xl flex items-center justify-center flex-shrink-0 animate-float">
            <Leaf className="w-7 h-7 text-rose-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm uppercase tracking-wider text-rose-700 mb-2 font-medium" style={{fontFamily: 'Work Sans, sans-serif'}}>
              Today's Micro-Practice
            </h3>
            <p className="text-2xl text-amber-900 font-light leading-relaxed" style={{fontFamily: 'Spectral, serif'}}>
              {suggestions[currentDay].microPractice}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-orange-200/50 card-hover animate-fadeInUp" style={{animationDelay: '0.7s'}}>
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-rose-400 rounded-full flex items-center justify-center flex-shrink-0">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-orange-600" style={{fontFamily: 'Work Sans, sans-serif'}}>
                  {activity.time}
                </span>
              </div>
              <h4 className="text-2xl text-amber-900 font-semibold mb-1" style={{fontFamily: 'Spectral, serif'}}>
                {activity.title}
              </h4>
              <p className="text-sm text-amber-700 mb-2" style={{fontFamily: 'Work Sans, sans-serif'}}>
                📍 {activity.location}
              </p>
              <p className="text-amber-800 font-light italic mb-3" style={{fontFamily: 'Work Sans, sans-serif'}}>
                {activity.benefit}
              </p>
              <button
                onClick={() => setShowMap(!showMap)}
                className="flex items-center gap-1.5 text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
                style={{ fontFamily: 'Work Sans, sans-serif' }}
              >
                <MapPin className="w-4 h-4" />
                {showMap ? 'Hide Route' : 'Show Route & Map'}
                {showMap ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {showMap && <RouteMapPreview location={activity.location} />}
            </div>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-full text-sm font-medium hover:shadow-lg transition-all whitespace-nowrap">
            Save Spot
          </button>
        </div>
      </div>

      {showMap && <BackupLocationsSection />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeInUp" style={{animationDelay: '0.8s'}}>
        <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-3xl p-6 border border-amber-200/50 card-hover">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/80 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-amber-900" style={{fontFamily: 'Spectral, serif'}}>
              Nourishment Suggestion
            </h3>
          </div>
          <p className="text-2xl text-amber-900 font-light mb-2" style={{fontFamily: 'Spectral, serif'}}>
            {suggestions[currentDay].meal.item}
          </p>
          <p className="text-sm text-amber-700 mb-3" style={{fontFamily: 'Work Sans, sans-serif'}}>
            📍 {suggestions[currentDay].meal.location}
          </p>
          <p className="text-sm text-amber-800 font-light leading-relaxed" style={{fontFamily: 'Work Sans, sans-serif'}}>
            {suggestions[currentDay].meal.why}
          </p>
        </div>

        <div className="bg-gradient-to-br from-rose-100 to-orange-100 rounded-3xl p-6 border border-rose-200/50 card-hover">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/80 rounded-full flex items-center justify-center">
              <Sprout className="w-5 h-5 text-rose-600" />
            </div>
            <h3 className="text-lg font-semibold text-amber-900" style={{fontFamily: 'Spectral, serif'}}>
              Shopping Suggestion
            </h3>
          </div>
          <p className="text-2xl text-amber-900 font-light mb-2" style={{fontFamily: 'Spectral, serif'}}>
            {suggestions[currentDay].grocery.item}
          </p>
          <p className="text-sm text-rose-700 mb-3" style={{fontFamily: 'Work Sans, sans-serif'}}>
            📍 {suggestions[currentDay].grocery.location}
          </p>
          <p className="text-sm text-amber-800 font-light leading-relaxed" style={{fontFamily: 'Work Sans, sans-serif'}}>
            {suggestions[currentDay].grocery.why}
          </p>
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-amber-200/50 card-hover animate-fadeInUp" style={{animationDelay: '0.9s'}}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-sm uppercase tracking-wider text-amber-700 mb-2 font-medium" style={{fontFamily: 'Work Sans, sans-serif'}}>
              Why This Matters
            </h3>
            <h4 className="text-xl text-amber-900 mb-2 font-semibold" style={{fontFamily: 'Spectral, serif'}}>
              Building Longevity Through Daily Choices
            </h4>
            <p className="text-amber-800 leading-relaxed font-light" style={{fontFamily: 'Work Sans, sans-serif'}}>
              These aren't just random suggestions—they're based on longevity research. Low-impact movement preserves your joints, anti-inflammatory foods reduce cellular aging, and micro-practices build consistency without overwhelm. You're not training for a marathon; you're building a life that lasts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
