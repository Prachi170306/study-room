
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/config";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "firebase/firestore";
import "./Onboarding.css";

function Onboarding() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    fullName: auth.currentUser?.displayName || "",
    college: "",
    course: "Computer Science and Engineering",
    year: "2nd Year",
    studyGoal: "3 hours",
    studyTime: "Evening",
    subjects: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const user = auth.currentUser;

    if (!user) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      const profileRef = doc(db, "users", user.uid);
      const existingProfile = await getDoc(profileRef);

      const profileData = {
        ...profile,
        email: user.email,
        updatedAt: serverTimestamp()
      };

      if (!existingProfile.exists()) {
        profileData.createdAt = serverTimestamp();
      }

      await setDoc(profileRef, profileData, { merge: true });

      navigate("/dashboard");

    } catch (err) {
      console.error("Profile saving error:", err);
      setError("Unable to save your profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-box">

        <h1>Study<span>Room.</span></h1>

        <h2>Welcome to StudyRoom!</h2>
        <p className="onboarding-subtitle">
          Let's personalize your learning experience.
        </p>

        <form onSubmit={handleSubmit}>

          <label>Full Name</label>
          <input
            type="text"
            name="fullName"
            placeholder="Enter your name"
            value={profile.fullName}
            onChange={handleChange}
            required
          />

          <label>College / University</label>
          <input
            type="text"
            name="college"
            placeholder="Enter your college name"
            value={profile.college}
            onChange={handleChange}
            required
          />

          <label>Course</label>
          <select name="course" value={profile.course} onChange={handleChange}>
            <option>Computer Science and Engineering</option>
            <option>Information Technology</option>
            <option>Artificial Intelligence and ML</option>
            <option>Electronics and Communication</option>
            <option>Other</option>
          </select>

          <label>Current Year</label>
          <select name="year" value={profile.year} onChange={handleChange}>
            <option>1st Year</option>
            <option>2nd Year</option>
            <option>3rd Year</option>
            <option>4th Year</option>
          </select>

          <label>Daily Study Goal</label>
          <select
            name="studyGoal"
            value={profile.studyGoal}
            onChange={handleChange}
          >
            <option>1 hour</option>
            <option>2 hours</option>
            <option>3 hours</option>
            <option>4 hours</option>
            <option>5+ hours</option>
          </select>

          <label>Preferred Study Time</label>
          <select
            name="studyTime"
            value={profile.studyTime}
            onChange={handleChange}
          >
            <option>Morning</option>
            <option>Afternoon</option>
            <option>Evening</option>
            <option>Night</option>
          </select>

          <label>Current Subjects</label>
          <input
            type="text"
            name="subjects"
            placeholder="e.g. DSA, DBMS, Operating Systems"
            value={profile.subjects}
            onChange={handleChange}
            required
          />

          {error && (
            <p style={{ color: "red" }}>{error}</p>
          )}

          <button
            type="submit"
            className="onboarding-btn"
            disabled={loading}
          >
            {loading ? "Saving Profile..." : "Save Profile & Continue"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default Onboarding;
