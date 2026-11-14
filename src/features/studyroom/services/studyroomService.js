import {
  collection,
  addDoc,
  getDoc,
  doc,
  updateDoc,
  arrayUnion,
  serverTimestamp
} from "firebase/firestore";

import { db } from "../../../firebase/firebase";

const roomsRef = collection(db, "studyRooms");

// Create a new study room
export const createStudyRoom = async (roomName, userId) => {
  try {
    const roomData = {
      roomName: roomName,
      createdBy: userId,
      createdAt: serverTimestamp(),
      members: [userId],
      isActive: true
    };

    const room = await addDoc(roomsRef, roomData);

    return room.id;

  } catch (error) {
    console.error("Error creating room:", error);
    throw error;
  }
};

// Join an existing study room
export const joinStudyRoom = async (roomId, userId) => {
  try {
    const roomRef = doc(db, "studyRooms", roomId);

    const roomSnapshot = await getDoc(roomRef);

    if (!roomSnapshot.exists()) {
      throw new Error("Room does not exist!");
    }

    if (!roomSnapshot.data().isActive) {
      throw new Error("This room is no longer active!");
    }

    await updateDoc(roomRef, {
      members: arrayUnion(userId)
    });

    return roomSnapshot.data();

  } catch (error) {
    console.error("Error joining room:", error);
    throw error;
  }
};