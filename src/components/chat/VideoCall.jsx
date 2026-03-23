import { useEffect, useRef } from "react";
import { useSocket } from "../context/SocketContext";

const VideoCall = ({ start, onClose, selectedUser, currentUser }) => {
  const videoRef = useRef(null);
  const socket = useSocket();

  useEffect(() => {
    let stream;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // 📞 CALL SEND TO FRIEND
        if (selectedUser) {
          console.log("📞 Calling user:", selectedUser.username);

          socket.emit("call-user", {
            to: selectedUser.id,
            from: currentUser.id,
          });
        }

      } catch (err) {
        console.error("Camera error:", err);
      }
    };

    if (start) {
      startCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };

  }, [start]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">

      {/* 🎥 SELF VIDEO */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />

      {/* 🔴 END CALL */}
      <div className="absolute bottom-10 w-full flex justify-center">
        <button
          onClick={onClose}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full text-lg shadow-lg"
        >
          End Call
        </button>
      </div>

    </div>
  );
};

export default VideoCall;