import {
  collectionGroup,
  getDocs,
  query,
  where
} from "firebase/firestore";

import { db } from "../../../firebase/firebase";

export const getStudyHistory = async (userId) => {
  try {
    const sessionsQuery = query(
      collectionGroup(db, "studySessions"),
      where("participantIds", "array-contains", userId)
    );

    const snapshot = await getDocs(sessionsQuery);

    const sessions = snapshot.docs.map((document) => ({
      id: document.id,
      ...document.data()
    }));

    // Sort newest sessions first
    sessions.sort((a, b) => {
      const dateA = a.completedAt?.toMillis?.() || 0;
      const dateB = b.completedAt?.toMillis?.() || 0;

      return dateB - dateA;
    });

    return sessions;

  } catch (error) {
    console.error("Error fetching study history:", error);
    throw error;
  }
};
