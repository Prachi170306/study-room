
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";

import { db, auth } from "../../../firebase";
import "./RoomPage.css";

import {
  startSharedTimer,
  pauseSharedTimer,
  resetSharedTimer,
  completeSharedTimer
} from "../services/sharedTimerService";

import { connectToRoomPresence } from "../services/presenceService";

function RoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  // Room states
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Authentication state
  const [currentUser, setCurrentUser] = useState(auth.currentUser);

  // Timer states
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [timerMessage, setTimerMessage] = useState("");
  const completionInProgress = useRef(false);

  // Presence state
  const [presence, setPresence] = useState({});

  // Check whether current user is host
  const isHost = room?.createdBy === currentUser?.uid;

  const timerMode = room?.timer?.mode || "focus";
  const timerStatus = room?.timer?.status || "paused";

  // Listen for authentication changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  // Listen for real-time room updates
  useEffect(() => {
    if (!roomId) return;

    setLoading(true);

    const roomRef = doc(db, "studyRooms", roomId);

    const unsubscribe = onSnapshot(
      roomRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setRoom({
            id: snapshot.id,
            ...snapshot.data()
          });
          setError("");
        } else {
          setRoom(null);
          setError("Room does not exist.");
        }

        setLoading(false);
      },
      (error) => {
        console.error("Error fetching room:", error);
        setError(error.message || "Unable to load room.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [roomId]);

  // Connect current user to Realtime Database presence
  useEffect(() => {
    if (!currentUser || !roomId) return;

    const unsubscribe = connectToRoomPresence(
      roomId,
      currentUser.uid,
      (presenceData) => {
        setPresence(presenceData);
      }
    );

    return () => unsubscribe();
  }, [roomId, currentUser]);

  // Reset completion guard when timer changes
  useEffect(() => {
    completionInProgress.current = false;
  }, [
    room?.timer?.endTime,
    room?.timer?.mode,
    room?.timer?.status
  ]);

  // Real-time countdown
  useEffect(() => {
    const timer = room?.timer;

    if (!timer || timer.status !== "running") {
      setSecondsLeft(
        timer?.remainingSeconds ??
        (timer?.mode === "break" ? 5 * 60 : 25 * 60)
      );

      return;
    }

    if (!timer.endTime) return;

    const updateCountdown = () => {
      const remaining = Math.max(
        0,
        Math.ceil((timer.endTime - Date.now()) / 1000)
      );

      setSecondsLeft(remaining);

      // Only host completes the timer
      if (
        remaining === 0 &&
        isHost &&
        currentUser &&
        !completionInProgress.current
      ) {
        completionInProgress.current = true;

        completeSharedTimer(roomId, currentUser.uid)
          .then(() => {
            setTimerMessage("");
          })
          .catch((error) => {
            console.error("Timer completion error:", error);

            setTimerMessage(
              `Timer completion failed: ${error.code || error.message}`
            );

            completionInProgress.current = false;
          });
      }
    };

    updateCountdown();

    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);

  }, [
    room?.timer?.status,
    room?.timer?.endTime,
    room?.timer?.mode,
    room?.timer?.remainingSeconds,
    isHost,
    currentUser,
    roomId
  ]);

  // Start / Pause timer
  const handleTimerStartPause = async () => {
    try {
      setTimerMessage("");

      if (!currentUser || !isHost) {
        setTimerMessage("Only the host can control the timer.");
        return;
      }

      if (timerStatus === "running") {
        await pauseSharedTimer(roomId, currentUser.uid);
      } else {
        await startSharedTimer(roomId, currentUser.uid);
      }

    } catch (error) {
      console.error("Timer error:", error);

      setTimerMessage(
        `Unable to update timer: ${error.code || error.message}`
      );
    }
  };

  // Reset timer
  const handleTimerReset = async () => {
    try {
      setTimerMessage("");

      if (!currentUser || !isHost) {
        setTimerMessage("Only the host can reset the timer.");
        return;
      }

      await resetSharedTimer(roomId, currentUser.uid);

    } catch (error) {
      console.error("Reset error:", error);

      setTimerMessage(
        `Unable to reset timer: ${error.code || error.message}`
      );
    }
  };

  // Format timer
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  // Copy Room ID
  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      alert("Room ID copied!");
    } catch (error) {
      console.error("Copy error:", error);
      alert("Unable to copy Room ID.");
    }
  };

  // Leave Room
  const handleLeaveRoom = () => {
    navigate(-1);
  };

  // Loading screen
  if (loading) {
    return (
      <div className="room-message">
        Loading room...
      </div>
    );
  }

  // Error screen
  if (error || !room) {
    return (
      <div className="room-message">
        {error || "Room not found"}

        <button onClick={handleLeaveRoom}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="room-page">

      {/* ROOM HEADER */}
      <div className="room-header">
        <div>
          <h1>{room.roomName}</h1>
          <p>
            Welcome to your collaborative study space!
          </p>
        </div>

        <button onClick={handleLeaveRoom}>
          Leave Room
        </button>
      </div>

      {/* ROOM INFORMATION */}
      <div className="room-info-card">
        <h3>Room Information</h3>

        <p>
          Room ID: <strong>{room.id}</strong>
        </p>

        <button onClick={copyRoomId}>
          Copy Room ID
        </button>

        <p>
          Status: {room.isActive ? "Active" : "Inactive"}
        </p>
      </div>

      {/* SHARED POMODORO TIMER */}
      <div className="shared-timer-card">

        <h2>Shared Study Timer</h2>

        <p className="timer-mode">
          {timerMode === "focus"
            ? "🎯 Focus Time"
            : "☕ Break Time"}
        </p>

        <div className="shared-timer-display">
          {String(minutes).padStart(2, "0")}:
          {String(seconds).padStart(2, "0")}
        </div>

        <p className="shared-timer-status">
          {timerStatus === "running"
            ? "Timer is running"
            : "Timer is paused"}
        </p>

        {isHost ? (
          <div className="shared-timer-controls">

            <button
              onClick={handleTimerStartPause}
              disabled={!room.isActive}
            >
              {timerStatus === "running" ? "Pause" : "Start"}
            </button>

            <button
              onClick={handleTimerReset}
              disabled={!room.isActive}
            >
              Reset
            </button>

          </div>
        ) : (
          <p className="host-notice">
            Only the room host can control the timer.
          </p>
        )}

        {timerMessage && (
          <p className="room-message">
            {timerMessage}
          </p>
        )}

      </div>

      {/* ROOM MEMBERS */}
      <div className="members-card">

        <h2>
          Room Members ({room.members?.length || 0})
        </h2>

        {room.members?.map((member, index) => (
          <div className="member-item" key={member}>

            <div className="member-avatar">
              {member === room.createdBy ? "H" : "S"}
            </div>

            <div>
              <h4>
                {member === room.createdBy
                  ? "Room Host"
                  : `Member ${index + 1}`}
              </h4>

              <p>
                {member === room.createdBy
                  ? "Host"
                  : "Participant"}
              </p>
            </div>

            <span
              className={`online-status ${
                presence[member]?.online ? "online" : "offline"
              }`}
            >
              <span className="status-dot"></span>

              {presence[member]?.online ? "Online" : "Offline"}
            </span>

          </div>
        ))}

      </div>

    </div>
  );
}

export default RoomPage;
