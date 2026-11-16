
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./studyRoom.css";
import { auth } from "../../../firebase/firebase";

import {
  createStudyRoom,
  joinStudyRoom
} from "../services/studyroomService";

function StudyRoom() {

  const navigate = useNavigate();

  const [roomName, setRoomName] = useState("");
  const [roomId, setRoomId] = useState("");

  const [createdRoomId, setCreatedRoomId] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);

  // CREATE ROOM
  const handleCreateRoom = async () => {

    if (!roomName.trim()) {
      setMessage("Please enter a room name.");
      return;
    }

    const user = auth.currentUser;

    if (!user) {
      setMessage("User authentication not ready. Please try again.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const newRoomId = await createStudyRoom(
        roomName.trim(),
        user.uid
      );

      setCreatedRoomId(newRoomId);
      setRoomName("");

      // Navigate to the newly created room
      navigate(`/study-room/${newRoomId}`);

    } catch (error) {
      console.error("Create room error:", error);
      setMessage(error.message || "Unable to create room.");
    } finally {
      setLoading(false);
    }
  };

  // JOIN ROOM
  const handleJoinRoom = async () => {

    if (!roomId.trim()) {
      setMessage("Please enter a Room ID.");
      return;
    }

    const user = auth.currentUser;

    if (!user) {
      setMessage("User authentication not ready. Please try again.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const enteredRoomId = roomId.trim();

      await joinStudyRoom(enteredRoomId, user.uid);

      setRoomId("");

      // Navigate to the joined room
      navigate(`/study-room/${enteredRoomId}`);

    } catch (error) {
      console.error("Join room error:", error);
      setMessage(error.message || "Unable to join room.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="studyroom-container">

      <div className="studyroom-header">
        <h1>Study Together</h1>
        <p>
          Create a room or join your friends to study together.
        </p>
      </div>

      <div className="studyroom-cards">

        {/* CREATE ROOM */}
        <div className="studyroom-card">

          <div className="studyroom-icon">＋</div>

          <h2>Create a Room</h2>

          <p>
            Start a study session and invite your
            friends to join you.
          </p>

          <input
            type="text"
            placeholder="Enter room name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />

          <button
            onClick={handleCreateRoom}
            disabled={loading}
          >
            {loading ? "Please wait..." : "Create Room"}
          </button>

        </div>

        {/* JOIN ROOM */}
        <div className="studyroom-card">

          <div className="studyroom-icon">↗</div>

          <h2>Join a Room</h2>

          <p>
            Have a Room ID? Enter it below and
            start studying with others.
          </p>

          <input
            type="text"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />

          <button
            onClick={handleJoinRoom}
            disabled={loading}
          >
            {loading ? "Please wait..." : "Join Room"}
          </button>

        </div>

      </div>

      {/* STATUS MESSAGE */}
      {message && (
        <p className="room-message">
          {message}
        </p>
      )}

    </div>
  );
}

export default StudyRoom;
