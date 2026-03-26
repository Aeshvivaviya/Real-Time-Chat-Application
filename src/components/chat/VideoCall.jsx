import { useEffect, useRef, useCallback, useState } from "react";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.relay.metered.ca:80" },
    {
      urls: "turn:global.relay.metered.ca:80",
      username: "75b79e13a28fadbf0a43f154",
      credential: "nvNyuTCixkzyRvbO",
    },
    {
      urls: "turn:global.relay.metered.ca:80?transport=tcp",
      username: "75b79e13a28fadbf0a43f154",
      credential: "nvNyuTCixkzyRvbO",
    },
    {
      urls: "turn:global.relay.metered.ca:443",
      username: "75b79e13a28fadbf0a43f154",
      credential: "nvNyuTCixkzyRvbO",
    },
    {
      urls: "turns:global.relay.metered.ca:443?transport=tcp",
      username: "75b79e13a28fadbf0a43f154",
      credential: "nvNyuTCixkzyRvbO",
    },
  ],
  iceCandidatePoolSize: 10,
};

const VideoCall = ({
  start,
  onClose,
  selectedUser,
  currentUser,
  socket,
  initiateCall = true,
  incomingOffer = null,
  onError,
}) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const startedRef = useRef(false); // prevent double-start
  const answeredRef = useRef(false); // prevent double answer

  const [connectionState, setConnectionState] = useState("connecting");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Timer
  useEffect(() => {
    if (connectionState !== "connected") return;
    const t = setInterval(() => setCallDuration((p) => p + 1), 1000);
    return () => clearInterval(t);
  }, [connectionState]);

  const formatDuration = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // Cleanup
  const cleanup = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    startedRef.current = false;
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getAudioTracks().forEach((t) => {
      t.enabled = isMuted;
    });
    setIsMuted((p) => !p);
  }, [isMuted]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getVideoTracks().forEach((t) => {
      t.enabled = isVideoOff;
    });
    setIsVideoOff((p) => !p);
  }, [isVideoOff]);

  useEffect(() => {
    if (!start || !socket || !selectedUser || !currentUser) return;
    if (startedRef.current) return; // already started
    startedRef.current = true;

    const pendingCandidates = [];
    let remoteDescSet = false;

    const addPendingCandidates = async () => {
      for (const c of pendingCandidates) {
        try {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(c));
        } catch (e) {
          console.error("ICE candidate error:", e);
        }
      }
      pendingCandidates.length = 0;
    };

    const initCall = async () => {
      try {
        // Get camera + mic
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        // Create peer
        const peer = new RTCPeerConnection({
          ...ICE_SERVERS,
          iceTransportPolicy: "all",
          bundlePolicy: "max-bundle",
          rtcpMuxPolicy: "require",
        });
        peerRef.current = peer;

        // Add local tracks
        stream.getTracks().forEach((t) => peer.addTrack(t, stream));

        // Remote stream
        peer.ontrack = (e) => {
          console.log("📺 Got remote track");
          if (remoteVideoRef.current && e.streams[0]) {
            remoteVideoRef.current.srcObject = e.streams[0];
          }
        };

        // ICE candidates
        peer.onicecandidate = (e) => {
          if (e.candidate && socket.connected) {
            console.log("❄️ Sending candidate:", e.candidate.type, e.candidate.address);
            socket.emit("ice-candidate", {
              to: selectedUser.id,
              candidate: e.candidate,
            });
          }
        };

        // Connection state
        peer.onconnectionstatechange = () => {
          console.log("🔗 Connection state:", peer.connectionState);
          setConnectionState(peer.connectionState);
          if (peer.connectionState === "failed") {
            onError?.("Connection failed. Please try again.");
            onClose?.();
          }
        };

        peer.oniceconnectionstatechange = () => {
          console.log("❄️ ICE state:", peer.iceConnectionState);
          if (peer.iceConnectionState === "connected" || peer.iceConnectionState === "completed") {
            setConnectionState("connected");
          } else if (peer.iceConnectionState === "failed") {
            peer.restartIce();
          }
        };

        if (initiateCall) {
          // CALLER: create offer
          const offer = await peer.createOffer();
          await peer.setLocalDescription(offer);
          socket.emit("call-user", {
            to: selectedUser.id,
            from: currentUser.id,
            fromUsername: currentUser.username,
            offer,
          });
          console.log("📞 Offer sent");
        } else if (incomingOffer) {
          // CALLEE: set remote desc + answer
          if (answeredRef.current) return;
          answeredRef.current = true;
          await peer.setRemoteDescription(new RTCSessionDescription(incomingOffer));
          remoteDescSet = true;
          await addPendingCandidates();
          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);
          socket.emit("answer-call", { to: selectedUser.id, answer });
          console.log("📞 Answer sent");
        }
      } catch (err) {
        console.error("Call error:", err);
        const isHTTP =
          window.location.protocol !== "https:" &&
          window.location.hostname !== "localhost";
        if (isHTTP) {
          onError?.("Camera blocked on HTTP. Use HTTPS or localhost.");
        } else if (err.name === "NotAllowedError") {
          onError?.("Camera permission denied.");
        } else if (err.name === "NotFoundError") {
          onError?.("No camera found.");
        } else {
          onError?.("Camera error: " + err.message);
        }
        onClose?.();
      }
    };

    // Socket handlers
    const onCallAnswered = async ({ answer }) => {
      try {
        if (!peerRef.current) return;
        if (peerRef.current.signalingState !== "have-local-offer") {
          console.warn("⚠️ Ignoring answer — wrong state:", peerRef.current.signalingState);
          return;
        }
        if (remoteDescSet) {
          console.warn("⚠️ Remote desc already set, ignoring duplicate answer");
          return;
        }
        console.log("📞 Got answer, setting remote description");
        await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        remoteDescSet = true;
        await addPendingCandidates();
      } catch (e) {
        console.error("Answer error:", e);
      }
    };

    const onIceCandidate = async ({ candidate }) => {
      if (!candidate) return;
      if (remoteDescSet && peerRef.current) {
        try {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error("ICE error:", e);
        }
      } else {
        // Queue until remote desc is set
        pendingCandidates.push(candidate);
      }
    };

    const onCallEnded = () => {
      cleanup();
      onClose?.();
    };

    socket.once("call-answered", onCallAnswered);
    socket.on("ice-candidate", onIceCandidate);
    socket.on("call-ended", onCallEnded);

    initCall();

    return () => {
      socket.off("call-answered", onCallAnswered);
      socket.off("ice-candidate", onIceCandidate);
      socket.off("call-ended", onCallEnded);
      cleanup();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!start) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">

      {/* Connecting overlay */}
      {connectionState !== "connected" && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
            <p className="text-white text-lg">Connecting to {selectedUser?.username}...</p>
            <p className="text-gray-400 text-sm mt-1">Please wait</p>
          </div>
        </div>
      )}

      {/* Call duration */}
      {connectionState === "connected" && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm z-20">
          {formatDuration(callDuration)}
        </div>
      )}

      {/* Remote video */}
      <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />

      {/* Local video PiP */}
      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
        className="absolute bottom-28 right-2 md:right-4 w-24 h-18 md:w-32 md:h-24 rounded-xl object-cover border-2 border-white/30 shadow-lg"
      />

      {/* Controls */}
      <div className="absolute bottom-16 md:bottom-20 w-full flex justify-center gap-3 md:gap-4">
        <button
          onClick={toggleMute}
          className={`p-3 md:p-4 rounded-full text-white shadow-lg transition-all ${isMuted ? "bg-red-600 hover:bg-red-700" : "bg-gray-700 hover:bg-gray-600"}`}
        >
          {isMuted ? (
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ) : (
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </button>

        <button
          onClick={toggleVideo}
          className={`p-3 md:p-4 rounded-full text-white shadow-lg transition-all ${isVideoOff ? "bg-red-600 hover:bg-red-700" : "bg-gray-700 hover:bg-gray-600"}`}
        >
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>

        <button
          onClick={onClose}
          className="bg-red-600 hover:bg-red-700 text-white px-5 md:px-8 py-3 md:py-4 rounded-full text-base md:text-lg shadow-lg font-semibold transition-all"
        >
          End Call
        </button>
      </div>

      {/* User info */}
      <div className="absolute top-3 left-3 md:top-4 md:left-4 bg-black/50 text-white px-3 py-1 md:px-4 md:py-2 rounded-lg z-20">
        <p className="text-xs md:text-sm font-medium">
          {connectionState === "connected" ? "In call with" : "Calling"} {selectedUser?.username}
        </p>
        <p className="text-xs text-gray-300 capitalize">{connectionState}</p>
      </div>
    </div>
  );
};

export default VideoCall;
