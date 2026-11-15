
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "firebase/firestore";
import "./Dashboard.css";

const defaultTasks = [
  { id: 1, title: "Revise Data Structures", done: false },
  { id: 2, title: "Practice DBMS queries", done: false },
  { id: 3, title: "Study Operating Systems", done: true }
];

function Dashboard() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [dashboardData, setDashboardData] = useState({
    tasks: defaultTasks,
    studyMinutes: 0
  });

  const [newTask, setNewTask] = useState("");

  // Load profile and dashboard data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        navigate("/login", { replace: true });
        return;
      }

      try {
        const profileRef = doc(db, "users", user.uid);
        const dashboardRef = doc(
          db,
          "users",
          user.uid,
          "dashboard",
          "data"
        );

        const [profileSnap, dashboardSnap] = await Promise.all([
          getDoc(profileRef),
          getDoc(dashboardRef)
        ]);

        if (!profileSnap.exists()) {
          navigate("/onboarding", { replace: true });
          return;
        }

        setProfile(profileSnap.data());

        if (dashboardSnap.exists()) {
          const savedData = dashboardSnap.data();

          setDashboardData({
            tasks: Array.isArray(savedData.tasks)
              ? savedData.tasks
              : defaultTasks,
            studyMinutes: Number(savedData.studyMinutes) || 0
          });
        }
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Save dashboard data
  const saveDashboardData = async (updatedData) => {
    const user = auth.currentUser;

    if (!user) return;

    try {
      const dashboardRef = doc(
        db,
        "users",
        user.uid,
        "dashboard",
        "data"
      );

      await setDoc(
        dashboardRef,
        {
          ...updatedData,
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Error saving dashboard data:", error);
      alert("Unable to save your changes. Please try again.");
    }
  };

  // Add a new task
  const addTask = (e) => {
    e.preventDefault();

    if (!newTask.trim()) return;

    const updatedData = {
      ...dashboardData,
      tasks: [
        ...dashboardData.tasks,
        {
          id: Date.now(),
          title: newTask.trim(),
          done: false
        }
      ]
    };

    setDashboardData(updatedData);
    saveDashboardData(updatedData);
    setNewTask("");
  };

  // Toggle task completion
  const toggleTask = (id) => {
    const updatedData = {
      ...dashboardData,
      tasks: dashboardData.tasks.map((task) =>
        task.id === id
          ? { ...task, done: !task.done }
          : task
      )
    };

    setDashboardData(updatedData);
    saveDashboardData(updatedData);
  };

  // Add study time
  const addStudyTime = () => {
    const updatedData = {
      ...dashboardData,
      studyMinutes: dashboardData.studyMinutes + 30
    };

    setDashboardData(updatedData);
    saveDashboardData(updatedData);
  };

  if (loading) {
    return <p>Loading your dashboard...</p>;
  }

  if (!profile) {
    return <p>Unable to load your profile. Please try again.</p>;
  }

  const subjects = Array.isArray(profile.subjects)
    ? profile.subjects
    : (profile.subjects || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

  const completedTasks = dashboardData.tasks.filter(
    (task) => task.done
  ).length;

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  return (
    <div className="dashboard-container">
      <aside className="dashboard-sidebar">
        <h2>Study<span>Room.</span></h2>

        <p className="sidebar-label">MENU</p>

       <a href="#overview" className="active">▪ Dashboard</a>
<a href="#subjects">◈ My Subjects</a>
<a href="#planner">☑ Study Planner</a>
<a href="#tracker">◷ Study Tracker</a>

<button
  type="button"
  className="sidebar-focus-btn"
  onClick={() => navigate("/focus")}
>
  🎯 Focus Room
</button>

        <div className="sidebar-bottom">
          <a href="/profile">⚙ Profile</a>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-date">{today}</p>

            <h1>
              Welcome back, {profile.fullName || "Student"}!
            </h1>

            <p className="dashboard-subtitle">
              Ready to make today productive?
            </p>
          </div>

          <div className="profile-avatar">
            {(profile.fullName || "S").charAt(0).toUpperCase()}
          </div>
        </header>

        <section className="stats-grid" id="overview">
          <div className="stat-card">
            <span>📚</span>
            <p>Total Subjects</p>
            <h2>{subjects.length}</h2>
          </div>

          <div className="stat-card">
            <span>✅</span>
            <p>Completed Tasks</p>
            <h2>
              {completedTasks}/{dashboardData.tasks.length}
            </h2>
          </div>

          <div className="stat-card">
            <span>⏱️</span>
            <p>Study Time Today</p>
            <h2>
              {Math.floor(dashboardData.studyMinutes / 60)}h{" "}
              {dashboardData.studyMinutes % 60}m
            </h2>
          </div>

          <div className="stat-card">
            <span>🎯</span>
            <p>Daily Study Goal</p>
            <h2>{profile.studyGoal || "3 hours"}</h2>
          </div>
        </section>

        <section className="dashboard-section" id="subjects">
          <div className="section-heading">
            <div>
              <h2>My Subjects</h2>
              <p>Your current learning subjects</p>
            </div>
          </div>

          <div className="subjects-grid">
            {subjects.map((subject, index) => (
              <div className="subject-card" key={index}>
                <div className="subject-icon">📖</div>
                <h3>{subject}</h3>
                <p>Keep learning and improving!</p>
              </div>
            ))}
          </div>
        </section>

        <section className="dashboard-section" id="planner">
          <div className="section-heading">
            <div>
              <h2>Today's Study Planner</h2>
              <p>Manage your daily study tasks</p>
            </div>

            <span className="task-count">
              {completedTasks} of {dashboardData.tasks.length} completed
            </span>
          </div>

          <form className="add-task-form" onSubmit={addTask}>
            <input
              type="text"
              placeholder="Add a new study task..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
            />

            <button type="submit">+ Add Task</button>
          </form>

          <div className="task-list">
            {dashboardData.tasks.map((task) => (
              <label className="task-item" key={task.id}>
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => toggleTask(task.id)}
                />

                <span className={task.done ? "task-done" : ""}>
                  {task.title}
                </span>
              </label>
            ))}
          </div>
        </section>

        <section className="dashboard-section" id="tracker">
          <div className="section-heading">
            <div>
              <h2>Study Tracker</h2>
              <p>Track your study time today</p>
            </div>
          </div>

          <div className="tracker-card">
            <div>
              <h3>
                {Math.floor(dashboardData.studyMinutes / 60)}h{" "}
                {dashboardData.studyMinutes % 60}m
              </h3>

              <p>Study time completed</p>
            </div>

            <button onClick={addStudyTime}>
              + Add 30 Minutes
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
