import {doc,getDoc,updateDoc,onSnapshot,serverTimestamp,runTransaction } from "firebase/firestore";

import { db } from "../../../firebase";

// Timer durations (in seconds)
const FOCUS_TIME = 10;
const BREAK_TIME = 5 * 60;

// Get room document reference
const getRoomRef = (roomId) => doc(db, "studyRooms", roomId);


// 1. START SHARED TIMER
export const startSharedTimer = async (roomId, userId) => {
  const roomRef = getRoomRef(roomId);
  const roomSnap = await getDoc(roomRef);

  if (!roomSnap.exists()) {
    throw new Error("Study room not found.");
  }

  const timer = roomSnap.data().timer || {
    mode: "focus",
    status: "paused",
    remainingSeconds: FOCUS_TIME,
    endTime: null
  };

  if (timer.status === "running") return;

  const remaining = timer.remainingSeconds ?? FOCUS_TIME;

  await updateDoc(roomRef, {
    timer: {
      ...timer,
      status: "running",
      endTime: Date.now() + remaining * 1000,
      updatedBy: userId,
      updatedAt: serverTimestamp()
    }
  });
};


// 2. PAUSE SHARED TIMER
export const pauseSharedTimer = async (roomId, userId) => {
  const roomRef = getRoomRef(roomId);
  const roomSnap = await getDoc(roomRef);

  if (!roomSnap.exists()) {
    throw new Error("Study room not found.");
  }

  const timer = roomSnap.data().timer;

  if (!timer || timer.status !== "running") return;

  const remaining = Math.max(
    0,
    Math.ceil((timer.endTime - Date.now()) / 1000)
  );

  await updateDoc(roomRef, {
    timer: {
      ...timer,
      status: "paused",
      remainingSeconds: remaining,
      endTime: null,
      updatedBy: userId,
      updatedAt: serverTimestamp()
    }
  });
};


// 3. RESET SHARED TIMER
export const resetSharedTimer = async (roomId, userId) => {
  const roomRef = getRoomRef(roomId);
  const roomSnap = await getDoc(roomRef);

  if (!roomSnap.exists()) {
    throw new Error("Study room not found.");
  }

  const timer = roomSnap.data().timer;

  const duration =
    timer?.mode === "break" ? BREAK_TIME : FOCUS_TIME;

  await updateDoc(roomRef, {
    timer: {
      mode: timer?.mode || "focus",
      status: "paused",
      remainingSeconds: duration,
      endTime: null,
      updatedBy: userId,
      updatedAt: serverTimestamp()
    }
  });
};


// 4. LISTEN TO REAL-TIME TIMER CHANGES
export const listenToSharedTimer = (roomId, callback) => {
  const roomRef = getRoomRef(roomId);

  return onSnapshot(roomRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data().timer || null);
    }
  });
};


// 5. COMPLETE TIMER AND RECORD FOCUS SESSION

// 5. COMPLETE TIMER AND RECORD FOCUS SESSION
export const completeSharedTimer = async (roomId, userId) => {
  const roomRef = getRoomRef(roomId);

  await runTransaction(db, async (transaction) => {
    const roomSnap = await transaction.get(roomRef);

    if (!roomSnap.exists()) return;

    const roomData = roomSnap.data();
    const timer = roomData.timer;

    if (!timer || timer.status !== "running") return;

    // Check whether the timer has actually finished
    if (timer.endTime > Date.now()) return;

    // Determine the next timer mode
    const completedMode = timer.mode;
    const nextMode =
      completedMode === "focus" ? "break" : "focus";

    const nextDuration =
      nextMode === "focus" ? FOCUS_TIME : BREAK_TIME;

    // Record only completed Focus sessions
    if (completedMode === "focus") {

      // Unique ID prevents duplicate session records
      const sessionId = `${roomId}_${timer.endTime}`;

      // IMPORTANT: Save inside the study room
      const sessionRef = doc(
        roomRef,
        "studySessions",
        sessionId
      );

      const existingSession = await transaction.get(sessionRef);

      if (!existingSession.exists()) {
        transaction.set(sessionRef, {
          roomId,
          roomName: roomData.roomName || "Study Room",
          completedBy: userId,
          participantIds: roomData.members || [userId],
          sessionType: "focus",
          durationMinutes: FOCUS_TIME / 60,
          durationSeconds: FOCUS_TIME,
          completedAt: serverTimestamp()
        });
      }
    }

    // Switch to the next timer mode
    transaction.update(roomRef, {
      timer: {
        mode: nextMode,
        status: "paused",
        remainingSeconds: nextDuration,
        endTime: null,
        updatedBy: userId,
        updatedAt: serverTimestamp()
      }
    });
  });
};
