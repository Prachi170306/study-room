
import {
  ref,
  onValue,
  onDisconnect,
  set,
  serverTimestamp
} from "firebase/database";

import { rtdb } from "../../../firebase";

export const connectToRoomPresence = (roomId, userId, callback) => {
  const connectedRef = ref(rtdb, ".info/connected");

  const userPresenceRef = ref(
    rtdb,
    `studyRooms/${roomId}/presence/${userId}`
  );

  const presenceRef = ref(
    rtdb,
    `studyRooms/${roomId}/presence`
  );

  let active = true;

  // Detect Firebase connection status
  const unsubscribeConnection = onValue(
    connectedRef,
    async (snapshot) => {
      if (snapshot.val() !== true || !active) return;

      try {
        // Automatically mark offline if the connection is lost
        await onDisconnect(userPresenceRef).set({
          online: false,
          lastSeen: serverTimestamp()
        });

        if (!active) return;

        // Mark user online
        await set(userPresenceRef, {
          online: true,
          connectedAt: serverTimestamp()
        });

      } catch (error) {
        console.error("Presence setup error:", error);
      }
    }
  );

  // Listen for all room members' presence
  const unsubscribePresence = onValue(
    presenceRef,
    (snapshot) => {
      callback(snapshot.val() || {});
    }
  );

  // Cleanup when the user leaves the room
  return () => {
    active = false;

    unsubscribeConnection();
    unsubscribePresence();

    // Explicitly mark the user offline
    onDisconnect(userPresenceRef)
      .cancel()
      .then(() =>
        set(userPresenceRef, {
          online: false,
          lastSeen: serverTimestamp()
        })
      )
      .catch((error) => {
        console.error("Presence cleanup error:", error);
      });
  };
};
