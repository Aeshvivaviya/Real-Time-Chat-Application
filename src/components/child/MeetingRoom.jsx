import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import MeetingHeader from './MeetingHeader';
import BottomControls from './BottomControls';
import ParticipantsPanel from './ParticipantsPanel';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

const MeetingRoom = () => {
  const { meetingId } = useParams();
  const [showParticipants, setShowParticipants] = useState(false);
  const [remoteStreams, setRemoteStreams] = useState([]); // [{ id, stream, name }]
  const [videoOn, setVideoOn] = useState(true);

  // Get logged-in user name from localStorage
  const currentUser = JSON.parse(localStorage.getItem('chatUser') || '{}');
  const myName = currentUser.username || currentUser.name || 'You';

  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peersRef = useRef({});         // { userId: { peer, name } }
  const pendingCandidates = useRef({}); // ICE queue
  const socketRef = useRef(null);
  const myId = useRef(`u-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`);

  const createPeer = useCallback((remoteId, socket, stream) => {
    peersRef.current[remoteId]?.peer?.close();

    const peer = new RTCPeerConnection(ICE_SERVERS);
    stream.getTracks().forEach(track => peer.addTrack(track, stream));

    peer.onicecandidate = ({ candidate }) => {
      if (candidate) {
        socket.emit('ice-candidate', { roomId: meetingId, candidate, from: myId.current });
      }
    };

    peer.ontrack = ({ streams }) => {
      if (!streams[0]) return;
      setRemoteStreams(prev => {
        if (prev.find(s => s.id === remoteId)) return prev;
        const name = peersRef.current[remoteId]?.name || 'Guest';
        return [...prev, { id: remoteId, stream: streams[0], name }];
      });
    };

    peer.onconnectionstatechange = () => {
      if (peer.connectionState === 'failed') peer.restartIce();
    };

    return peer;
  }, [meetingId]);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    const init = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      // Send name along with join
      socket.emit('join-room', meetingId, myId.current, myName);
    };

    // Existing user → new user joined → send offer
    socket.on('user-joined', async ({ userId: newUserId, name: remoteName }) => {
      const stream = localStreamRef.current;
      if (!stream) return;
      const peer = createPeer(newUserId, socket, stream);
      peersRef.current[newUserId] = { peer, name: remoteName };

      const offer = await peer.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
      await peer.setLocalDescription(offer);
      socket.emit('offer', { roomId: meetingId, sdp: peer.localDescription, from: myId.current, fromName: myName });
    });

    // New user → receive offer → send answer
    socket.on('offer', async ({ sdp, from, fromName }) => {
      const stream = localStreamRef.current;
      if (!stream) return;
      const peer = createPeer(from, socket, stream);
      peersRef.current[from] = { peer, name: fromName };

      await peer.setRemoteDescription(new RTCSessionDescription(sdp));
      const queued = pendingCandidates.current[from] || [];
      for (const c of queued) await peer.addIceCandidate(new RTCIceCandidate(c)).catch(console.error);
      delete pendingCandidates.current[from];

      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      socket.emit('answer', { roomId: meetingId, sdp: peer.localDescription, from: myId.current, fromName: myName });
    });

    // Receive answer
    socket.on('answer', async ({ sdp, from }) => {
      const peer = peersRef.current[from]?.peer;
      if (!peer) return;
      await peer.setRemoteDescription(new RTCSessionDescription(sdp));
      const queued = pendingCandidates.current[from] || [];
      for (const c of queued) await peer.addIceCandidate(new RTCIceCandidate(c)).catch(console.error);
      delete pendingCandidates.current[from];
    });

    // ICE candidates
    socket.on('ice-candidate', ({ candidate, from }) => {
      const peer = peersRef.current[from]?.peer;
      if (peer && peer.remoteDescription) {
        peer.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error);
      } else {
        if (!pendingCandidates.current[from]) pendingCandidates.current[from] = [];
        pendingCandidates.current[from].push(candidate);
      }
    });

    socket.on('user-left', (leftId) => {
      peersRef.current[leftId]?.peer?.close();
      delete peersRef.current[leftId];
      setRemoteStreams(prev => prev.filter(s => s.id !== leftId));
    });

    socket.on('call-ended', () => {
      Object.values(peersRef.current).forEach(({ peer }) => peer.close());
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      socket.disconnect();
      window.location.href = '/dashboard';
    });

    init().catch(console.error);

    return () => {
      Object.values(peersRef.current).forEach(({ peer }) => peer.close());
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      socketRef.current?.disconnect();
    };
  }, [meetingId, createPeer, myName]);

  const handleEndCall = () => {
    socketRef.current?.emit('user-left', meetingId);
    Object.values(peersRef.current).forEach(({ peer }) => peer.close());
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    socketRef.current?.disconnect();
    window.location.href = '/dashboard';
  };

  const handleToggleVideo = (val) => {
    setVideoOn(val);
    localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = val; });
  };

  const handleToggleAudio = (val) => {
    localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = val; });
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">

      {/* Remote videos */}
      {remoteStreams.length === 0 ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center mx-auto mb-3 text-white text-3xl font-bold">
              {myName.charAt(0).toUpperCase()}
            </div>
            <p className="text-white font-medium text-base">{myName}</p>
            <p className="text-gray-400 text-sm mt-1">Waiting for others to join...</p>
          </div>
        </div>
      ) : (
        <div className={`w-full h-full grid gap-1 ${remoteStreams.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {remoteStreams.map(({ id, stream, name }) => (
            <RemoteVideo key={id} stream={stream} name={name} />
          ))}
        </div>
      )}

      {/* Local PiP */}
      <div className="absolute bottom-20 right-4 w-36 sm:w-48 aspect-video rounded-xl overflow-hidden border-2 border-white/20 shadow-xl z-20 bg-black">
        {videoOn
          ? <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center bg-gray-800">
              <span className="text-white text-xs">Cam off</span>
            </div>
        }
        <span className="absolute bottom-1 left-1 text-white text-[10px] bg-black/60 px-1.5 py-0.5 rounded">
          {myName} (You)
        </span>
      </div>

      <MeetingHeader />
      <BottomControls
        onToggleParticipants={() => setShowParticipants(p => !p)}
        onToggleVideo={handleToggleVideo}
        onToggleAudio={handleToggleAudio}
        onEndCall={handleEndCall}
      />
      {showParticipants && <ParticipantsPanel onClose={() => setShowParticipants(false)} />}
    </div>
  );
};

const RemoteVideo = ({ stream, name }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && stream) ref.current.srcObject = stream;
  }, [stream]);

  return (
    <div className="relative w-full h-full bg-black">
      <video ref={ref} autoPlay playsInline className="w-full h-full object-cover" />
      {/* Name overlay */}
      <div className="absolute bottom-3 left-3 bg-black/60 text-white text-sm px-2 py-1 rounded-lg">
        {name}
      </div>
    </div>
  );
};

export default MeetingRoom;
