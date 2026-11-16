
import { auth, loginAnonymously } from "./firebase";

loginAnonymously()
  .then((result) => {
    console.log("Anonymous login successful!");
    console.log("User UID:", result.user.uid);
  })
  .catch((error) => {
    console.error("Login failed:", error.message);
  });
