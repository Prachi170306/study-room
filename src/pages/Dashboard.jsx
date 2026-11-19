
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import "./Dashboard.css";
import useNotifications from "../features/notifications/hooks/useNotifications";

const defaultTasks = [
  { id: 1, title: "Revise Data Structures", done: false },
  { id: 2, title: "Practice DBMS queries", done: false },
  { id: 3, title: "Study Operating Systems", done: true },
];

function Dashboard() {
  const navigate = useNavigate();

  const {
    notifications,
    stats,
    loading: notificationsLoading,
    error: notificationsError,
    toggleReadStatus,
    markAllAsRead,
  } = useNotifications();

  const unreadCount = stats?.unread || 0;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [newTask, setNewTask] = useState("");

  const [activeSection, setActiveSection] = useState(() => {
    const section = window.location.hash.replace("#", "");
    return ["overview", "subjects", "tracker"].includes(section)
      ? section
      : "overview";
  });

  const [dashboardData, setDashboardData] = useState({
    tasks: defaultTasks,
    studyMinutes: 0,
  });

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
          getDoc(dashboardRef),
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
            studyMinutes: Number(savedData.studyMinutes) || 0,
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
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Error saving dashboard data:", error);
      alert("Unable to save your changes. Please try again.");
    }
  };

  // Add a task
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
          done: false,
        },
      ],
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
      ),
    };

    setDashboardData(updatedData);
    saveDashboardData(updatedData);
  };

  // Add 30 minutes of study time
  const addStudyTime = () => {
    const updatedData = {
      ...dashboardData,
      studyMinutes: dashboardData.studyMinutes + 30,
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
        .map((subject) => subject.trim())
        .filter(Boolean);

  const completedTasks = dashboardData.tasks.filter(
    (task) => task.done
  ).length;

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const sidebarLinks = [
    { name: "Dashboard", icon: "▪", href: "#overview", section: "overview" },
    { name: "My Subjects", icon: "◈", href: "#subjects", section: "subjects" },
    { name: "Study Tracker", icon: "◷", href: "#tracker", section: "tracker" },
    { name: "Chat", icon: "💬", href: "/chat" },
    { name: "Tasks / To-do List", icon: "☑", href: "/tasks" },
    { name: "Focus Room", icon: "🎯", href: "/focus" },
    { name: "Study Rooms", icon: "👥", href: "/studyroom" },
  ];

  const handleNavigation = (item, e) => {
    if (item.section) {
      e.preventDefault();
      setActiveSection(item.section);
      window.history.replaceState(null, "", item.href);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside
        className={`dashboard-sidebar ${
          sidebarOpen ? "sidebar-open" : "sidebar-closed"
        }`}
      >
        <button
          type="button"
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {sidebarOpen ? "◀" : "☰"}
        </button>

        {sidebarOpen && (
          <h2>
            Study<span>Room.</span>
          </h2>
        )}

        <p className="sidebar-label">
          {sidebarOpen ? "MENU" : ""}
        </p>

        {sidebarLinks.map((item) => (
          <a
            key={item.name}
            href={item.href}
            onClick={(e) => handleNavigation(item, e)}
            title={item.name}
            className={
              item.section === activeSection ? "active" : ""
            }
          >
            <span>{item.icon}</span>
            {sidebarOpen && ` ${item.name}`}
          </a>
        ))}
      </aside>

      {/* Main Dashboard */}
      <main className="dashboard-main">
        {/* Header */}
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

          <div className="dashboard-header-actions">
            <button
              type="button"
              className="notification-bell"
              aria-label="Open notifications"
              onClick={() => setShowNotifications(true)}
            >
              🔔
              {unreadCount > 0 && (
                <span className="notification-badge">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              type="button"
              className="profile-avatar"
              aria-label="Open profile"
              onClick={() => navigate("/profile")}
            >
              {(profile.fullName || "S").charAt(0).toUpperCase()}
            </button>
          </div>
        </header>

        {/* Notification Drawer */}
        {showNotifications && (
          <>
            <button
              type="button"
              className="notification-overlay"
              aria-label="Close notifications"
              onClick={() => setShowNotifications(false)}
            />

            <aside className="notification-drawer">
              <div className="notification-drawer-header">
                <div>
                  <h2>Notifications</h2>
                  <p>
                    You have {unreadCount} unread notifications
                  </p>

                  {unreadCount > 0 && (
                    <button
                      type="button"
                      className="mark-all-read"
                      onClick={markAllAsRead}
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  className="notification-close"
                  onClick={() => setShowNotifications(false)}
                  aria-label="Close notifications"
                >
                  ×
                </button>
              </div>

              <div className="notification-list">
                {notificationsLoading ? (
                  <p>Loading notifications...</p>
                ) : notificationsError ? (
                  <p>Unable to load notifications.</p>
                ) : notifications.length === 0 ? (
                  <p>No notifications yet.</p>
                ) : (
                  notifications.map((notification) => (
                    <button
                      type="button"
                      key={notification.id}
                      className={`notification-item ${
                        notification.read ? "read" : "unread"
                      }`}
                      onClick={() =>
                        toggleReadStatus(notification.id)
                      }
                    >
                      <span className="notification-icon">
                        {notification.type === "message"
                          ? "💬"
                          : notification.type === "task"
                            ? "✅"
                            : notification.type === "group"
                              ? "👥"
                              : "🔔"}
                      </span>

                      <div className="notification-content">
                        <h3>{notification.title}</h3>
                        <p>{notification.message}</p>
                        <small>
                          {notification.createdAt?.toDate
                            ? notification.createdAt
                                .toDate()
                                .toLocaleString()
                            : "Recently"}
                        </small>
                      </div>

                      {!notification.read && (
                        <span className="unread-dot" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </aside>
          </>
        )}

        {/* Overview */}
        {activeSection === "overview" && (
          <>
            <section className="stats-grid">
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

            {/* Study Planner */}
            <section className="dashboard-section">
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
          </>
        )}

        {/* Subjects */}
        {activeSection === "subjects" && (
          <section className="dashboard-section">
            <div className="section-heading">
              <div>
                <h2>My Subjects</h2>
                <p>Your current learning subjects</p>
              </div>
            </div>

            <div className="subjects-grid">
              {subjects.length > 0 ? (
                subjects.map((subject, index) => (
                  <div className="subject-card" key={index}>
                    <div className="subject-icon">📖</div>
                    <h3>{subject}</h3>
                    <p>Keep learning and improving!</p>
                  </div>
                ))
              ) : (
                <p>No subjects added yet.</p>
              )}
            </div>
          </section>
        )}

        {/* Study Tracker */}
        {activeSection === "tracker" && (
          <section className="dashboard-section">
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

              <button type="button" onClick={addStudyTime}>
                + Add 30 Minutes
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
