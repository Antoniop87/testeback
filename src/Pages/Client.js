import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import html2canvas from 'html2canvas';

const ScreenShareClient = () => {
  const [pc, setPc] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const socket = io();

    async function startReceive() {
      const pc = new RTCPeerConnection();
      pc.addTransceiver('video', { direction: 'recvonly' });

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          event.candidate.usernameFragment = null;
          socket.emit('candidate', event.candidate);
        }
      };

      pc.ontrack = (event) => {
        videoRef.current.srcObject = event.streams[0];
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('offer', offer);
      setPc(pc);
    }

    socket.on('answer', async (answer) => {
      console.log(answer);
      await pc.setRemoteDescription(answer);
    });

    socket.on('candidate', async (candidate) => {
      await pc.addIceCandidate(candidate);
    });

    return () => {
      socket.disconnect();
    }
  }, [pc]);

  function capture() {
    html2canvas(videoRef.current).then(canvas => {
      const link = document.createElement('a');
      link.download = 'capture.png';
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  }

  return (
    <div>
      <h1>Screen Share Client</h1>
      <button onClick={startReceive}>Start Receive</button>
      <button onClick={capture}>Capture</button>
      <video ref={videoRef} autoPlay></video>
    </div>
  );
};

export default ScreenShareClient;
