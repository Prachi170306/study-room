
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  getDocs,
  writeBatch
} from "firebase/firestore";

import { db } from "../../../firebase/config";

// Subscribe to the logged-in user's notifications
export function subscribeToNotifications(userId, callback, onError) {
  const notificationsRef = collection(
    db,
    "users",
    userId,
    "notifications"
  );

  const notificationsQuery = query(
    notificationsRef,
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    notificationsQuery,
    (snapshot) => {
      const notifications = snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data()
      }));

      callback(notifications);
    },
    onError
  );
}

// Mark an individual notification as read or unread
export async function updateNotificationReadStatus(
  userId,
  notificationId,
  read
) {
  const notificationRef = doc(
    db,
    "users",
    userId,
    "notifications",
    notificationId
  );

  await updateDoc(notificationRef, {
    read
  });
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(userId) {
  const notificationsRef = collection(
    db,
    "users",
    userId,
    "notifications"
  );

  const snapshot = await getDocs(notificationsRef);
  const batch = writeBatch(db);

  snapshot.docs.forEach((document) => {
    if (!document.data().read) {
      batch.update(document.ref, {
        read: true
      });
    }
  });

  await batch.commit();
}
