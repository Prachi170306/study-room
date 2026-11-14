
import {
  collection,
  addDoc,
  serverTimestamp
} from "firebase/firestore";

import {
  db,
  auth,
  loginAnonymously
} from "../../../firebase/firebase";

export const saveFocusSession = async (sessionData) => {
  try {
    // Get the currently logged-in user
    let user = auth.currentUser;

    // Sign in anonymously if no user exists
    if (!user) {
      const result = await loginAnonymously();
      user = result.user;
    }

    // Save session in Firestore
    await addDoc(collection(db, "focusSessions"), {
      ...sessionData,
      userId: user.uid,
      createdAt: serverTimestamp(),
    });

    console.log("Focus session saved successfully!");
    console.log("User ID:", user.uid);

  } catch (error) {
    console.error("Error saving focus session:", error);
    throw error;
  }
};
