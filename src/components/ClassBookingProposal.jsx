import { useMemo, useState } from 'react';
import { CheckCircle2, RefreshCw } from 'lucide-react';

const CLASS_OPTIONS = [
  { weekday: 'Monday', time: '7:00 AM', classType: 'Yoga', location: 'Mission District, San Francisco' },
  { weekday: 'Monday', time: '6:30 PM', classType: 'Weight Training', location: 'SoMa, San Francisco' },
  { weekday: 'Tuesday', time: '8:00 AM', classType: 'Pilates', location: 'Noe Valley, San Francisco' },
  { weekday: 'Tuesday', time: '6:00 PM', classType: 'Crossfit', location: 'Dogpatch, San Francisco' },
  { weekday: 'Wednesday', time: '7:30 AM', classType: 'Weight Training', location: 'Financial District, San Francisco' },
  { weekday: 'Wednesday', time: '5:45 PM', classType: 'Yoga', location: 'Hayes Valley, San Francisco' },
  { weekday: 'Thursday', time: '7:00 AM', classType: 'Pilates', location: 'Marina District, San Francisco' },
  { weekday: 'Thursday', time: '6:30 PM', classType: 'Weight Training', location: 'Pacific Heights, San Francisco' },
  { weekday: 'Friday', time: '8:00 AM', classType: 'Yoga', location: 'Inner Sunset, San Francisco' },
  { weekday: 'Friday', time: '5:30 PM', classType: 'Crossfit', location: 'Potrero Hill, San Francisco' },
  { weekday: 'Saturday', time: '9:00 AM', classType: 'Pilates', location: 'Cole Valley, San Francisco' },
  { weekday: 'Saturday', time: '11:00 AM', classType: 'Weight Training', location: 'Russian Hill, San Francisco' },
  { weekday: 'Sunday', time: '9:30 AM', classType: 'Yoga', location: 'Outer Richmond, San Francisco' },
  { weekday: 'Sunday', time: '4:00 PM', classType: 'Pilates', location: 'Inner Richmond, San Francisco' },
  { weekday: 'Monday', time: '12:15 PM', classType: 'Crossfit', location: 'South Beach, San Francisco' },
  { weekday: 'Tuesday', time: '12:00 PM', classType: 'Weight Training', location: 'Nob Hill, San Francisco' },
  { weekday: 'Wednesday', time: '12:30 PM', classType: 'Yoga', location: 'Bernal Heights, San Francisco' },
  { weekday: 'Thursday', time: '12:15 PM', classType: 'Crossfit', location: 'Castro, San Francisco' },
  { weekday: 'Friday', time: '12:00 PM', classType: 'Pilates', location: 'North Beach, San Francisco' },
  { weekday: 'Sunday', time: '6:00 PM', classType: 'Weight Training', location: 'Presidio Heights, San Francisco' },
];

function typeBadgeStyle(classType) {
  if (classType === 'Yoga') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (classType === 'Pilates') return 'bg-sky-100 text-sky-700 border-sky-200';
  if (classType === 'Crossfit') return 'bg-rose-100 text-rose-700 border-rose-200';
  return 'bg-amber-100 text-amber-700 border-amber-200';
}

export default function ClassBookingProposal() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [confirmedOption, setConfirmedOption] = useState(null);

  const currentOption = useMemo(() => CLASS_OPTIONS[currentIndex], [currentIndex]);

  const handleSuggestOther = () => {
    setCurrentIndex((prev) => (prev + 1) % CLASS_OPTIONS.length);
  };

  const handleAccept = () => {
    setConfirmedOption(currentOption);
  };

  const handleChangePlan = () => {
    setConfirmedOption(null);
    handleSuggestOther();
  };

  return (
    <div className="mt-6 rounded-2xl border border-orange-200/60 bg-gradient-to-br from-orange-50/90 to-rose-50/80 p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h4 className="text-sm uppercase tracking-wider text-orange-700 font-semibold" style={{fontFamily: 'Work Sans, sans-serif'}}>
            Class Booking Proposal
          </h4>
          <p className="text-sm text-amber-700 mt-1" style={{fontFamily: 'Work Sans, sans-serif'}}>
            I found a local class that could gently boost your longevity score.
          </p>
        </div>
        <span className="text-xs rounded-full bg-white/80 px-3 py-1 text-amber-700 border border-orange-100" style={{fontFamily: 'Work Sans, sans-serif'}}>
          Option {currentIndex + 1} of {CLASS_OPTIONS.length}
        </span>
      </div>

      {confirmedOption ? (
        <div className="rounded-2xl border border-green-200 bg-green-50/80 p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <p className="text-sm uppercase tracking-wide font-semibold text-green-700" style={{fontFamily: 'Work Sans, sans-serif'}}>
              Confirmed Plan
            </p>
          </div>
          <p className="text-2xl text-amber-900 font-semibold" style={{fontFamily: 'Spectral, serif'}}>
            {confirmedOption.weekday} · {confirmedOption.time}
          </p>
          <p className="mt-1 text-sm text-amber-700" style={{fontFamily: 'Work Sans, sans-serif'}}>
            📍 {confirmedOption.location}
          </p>
          <span className={`inline-block mt-2 text-sm px-3 py-1 rounded-full border ${typeBadgeStyle(confirmedOption.classType)}`} style={{fontFamily: 'Work Sans, sans-serif'}}>
            {confirmedOption.classType}
          </span>
          <div className="mt-4">
            <button
              onClick={handleChangePlan}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-amber-800 border border-amber-200 text-sm font-medium hover:bg-amber-50 transition-all"
              style={{fontFamily: 'Work Sans, sans-serif'}}
            >
              <RefreshCw className="w-4 h-4" />
              Book more classes
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-orange-200/70 bg-white/80 p-4">
          <p className="text-2xl text-amber-900 font-semibold" style={{fontFamily: 'Spectral, serif'}}>
            {currentOption.weekday} · {currentOption.time}
          </p>
          <p className="mt-1 text-sm text-amber-700" style={{fontFamily: 'Work Sans, sans-serif'}}>
            📍 {currentOption.location}
          </p>
          <span className={`inline-block mt-2 text-sm px-3 py-1 rounded-full border ${typeBadgeStyle(currentOption.classType)}`} style={{fontFamily: 'Work Sans, sans-serif'}}>
            {currentOption.classType}
          </span>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={handleAccept}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-medium hover:shadow-lg transition-all"
              style={{fontFamily: 'Work Sans, sans-serif'}}
            >
              Confirm
            </button>
            <button
              onClick={handleSuggestOther}
              className="px-5 py-2.5 rounded-full bg-white text-amber-800 border border-amber-200 text-sm font-medium hover:bg-amber-50 transition-all"
              style={{fontFamily: 'Work Sans, sans-serif'}}
            >
              Maybe next time
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
