import React from 'react';
import { useParams } from 'react-router-dom';
import { Shield } from 'lucide-react';

const MeetingHeader = () => {
  const { meetingId } = useParams();

  // Format time
  const [time, setTime] = React.useState('');
  React.useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/60 to-transparent z-10">
      <div>
        <h1 className="text-white font-semibold text-sm sm:text-base">
          aeshvi vaviya's Meeting
        </h1>
        <div className="flex items-center gap-1 mt-0.5">
          <Shield size={12} className="text-green-400" />
          
          <span className="text-gray-400 text-xs">ID: {meetingId}</span>
        </div>
      </div>
      <span className="text-gray-300 text-sm">{time}</span>
    </div>
  );
};

export default MeetingHeader;
