
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  onAuthStateChanged,
  signOut,
  deleteUser
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp
} from "firebase/firestore";
import { auth, db } from "../firebase/config";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({
    fullName: "",
    college: "",
    course: "",
    year: "",
    bio: "",
    subjects: "",
    studyGoal: "3 hours"
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate("/login", { replace: true });
        return;
      }

      setUser(currentUser);

      try {
        const profileRef = doc(db, "users", currentUser.uid);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          const data = profileSnap.data();

          setProfile({
            fullName: data.fullName || currentUser.displayName || "",
            college: data.college || "",
            course: data.course || "",
            year: data.year || "",
            bio: data.bio || "",
            subjects: Array.isArray(data.subjects)
              ? data.subjects.join(", ")
              : data.subjects || "",
            studyGoal: data.studyGoal || "3 hours"
          });
        } else {
          setProfile((prev) => ({
            ...prev,
            fullName: currentUser.displayName || ""
          }));
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        alert("Unable to load your profile.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!user) return;

    setSaving(true);

    try {
      const profileRef = doc(db, "users", user.uid);

      const updatedProfile = {
        ...profile,
        subjects: profile.subjects
          .split(",")
          .map((subject) => subject.trim())
          .filter(Boolean),
        email: user.email || "",
        updatedAt: serverTimestamp()
      };

      await setDoc(profileRef, updatedProfile, { merge: true });

      setProfile((prev) => ({
        ...prev,
        subjects: updatedProfile.subjects.join(", ")
      }));

      setEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Unable to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      alert("Unable to log out.");
    }
  };

  const handleDeleteAccount = async () => {
  if (!user) return;

  const confirmed = window.confirm(
    "Are you sure you want to permanently delete your account? This action cannot be undone."
  );

  if (!confirmed) return;

  const doubleConfirmed = window.confirm(
    "Final confirmation: Delete your StudyRoom account?"
  );

  if (!doubleConfirmed) return;

  try {
    // Remove the known Firestore profile and dashboard documents
    await deleteDoc(doc(db, "users", user.uid, "dashboard", "data"));
    await deleteDoc(doc(db, "users", user.uid));

    // Delete the Firebase Authentication account
    await deleteUser(user);

    alert("Your account has been deleted successfully.");
    navigate("/signup", { replace: true });

  } catch (error) {
    console.error("Account deletion error:", error);

    if (error.code === "auth/requires-recent-login") {
      alert(
        "For security, please log out, log in again, and retry account deletion."
      );
      return;
    }

    alert("Unable to delete your account. Please try again.");
  }
};

  if (loading) {
    return <div className="profile-loading">Loading your profile...</div>;
  }

  if (!user) return null;

  const initials = (profile.fullName || "Student")
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="profile-page">
      <header className="profile-topbar">
        <h2>Study<span>Room.</span></h2>

        <button
          className="back-dashboard-btn"
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>
      </header>

      <main className="profile-content">
        <div className="profile-heading">
          <div>
            <p className="profile-eyebrow">YOUR ACCOUNT</p>
            <h1>My Profile</h1>
            <p>Manage your personal information and study preferences.</p>
          </div>

          <div className="profile-account-actions">
  <button
    className="logout-btn"
    onClick={handleLogout}
  >
    Logout
  </button>

  <button
    className="delete-account-btn"
    onClick={handleDeleteAccount}
  >
    Delete Account
  </button>
</div>
        </div>

        <section className="profile-card">
          <div className="profile-banner"></div>

          <div className="profile-summary">
            <div className="profile-avatar-large">{initials}</div>

            <div className="profile-identity">
              <h2>{profile.fullName || "Student"}</h2>
              <p>{user.email}</p>
              <span className="profile-tag">Student Account</span>
            </div>

            {!editing && (
              <button
                className="edit-profile-btn"
                onClick={() => setEditing(true)}
              >
                ✎ Edit Profile
              </button>
            )}
          </div>

          <form onSubmit={handleSave}>
            <div className="profile-form-section">
              <h3>Personal Information</h3>
              <p>Your basic account details</p>

              <div className="profile-fields">
                <div className="profile-field">
                  <label>Full Name</label>
                  <input
                    name="fullName"
                    value={profile.fullName}
                    onChange={handleChange}
                    disabled={!editing}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="profile-field">
                  <label>Email Address</label>
                  <input
                    value={user.email || ""}
                    disabled
                  />
                </div>

                <div className="profile-field">
                  <label>College / University</label>
                  <input
                    name="college"
                    value={profile.college}
                    onChange={handleChange}
                    disabled={!editing}
                    placeholder="Enter your college"
                  />
                </div>

                <div className="profile-field">
                  <label>Course / Degree</label>
                  <input
                    name="course"
                    value={profile.course}
                    onChange={handleChange}
                    disabled={!editing}
                    placeholder="e.g. B.Tech CSE"
                  />
                </div>

                <div className="profile-field">
                  <label>Academic Year</label>
                  <input
                    name="year"
                    value={profile.year}
                    onChange={handleChange}
                    disabled={!editing}
                    placeholder="e.g. 2nd Year"
                  />
                </div>

                <div className="profile-field">
                  <label>Daily Study Goal</label>
                  <select
                    name="studyGoal"
                    value={profile.studyGoal}
                    onChange={handleChange}
                    disabled={!editing}
                  >
                    <option value="1 hour">1 hour</option>
                    <option value="2 hours">2 hours</option>
                    <option value="3 hours">3 hours</option>
                    <option value="4 hours">4 hours</option>
                    <option value="5 hours">5 hours</option>
                    <option value="6 hours">6 hours</option>
                    <option value="8 hours">8 hours</option>
                  </select>
                </div>

                <div className="profile-field full-width">
                  <label>Subjects</label>
                  <input
                    name="subjects"
                    value={profile.subjects}
                    onChange={handleChange}
                    disabled={!editing}
                    placeholder="e.g. DBMS, Java, Data Structures"
                  />
                  <small>Separate subjects using commas.</small>
                </div>

                <div className="profile-field full-width">
                  <label>About Me</label>
                  <textarea
                    name="bio"
                    value={profile.bio}
                    onChange={handleChange}
                    disabled={!editing}
                    placeholder="Tell us a little about yourself..."
                    rows="4"
                  />
                </div>
              </div>
            </div>

            {editing && (
              <div className="profile-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => window.location.reload()}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-profile-btn"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </form>
        </section>
      </main>
    </div>
  );
}

export default Profile;
