
import React, { useState } from "react";
import "./Dashboard.css";

function Dashboard() {
  const savedProfile = JSON.parse(
    sessionStorage.getItem("studyProfile") || "{}"
  );

  const [tasks, setTasks] = useState([
    { id: 1, title: "Revise Data Structures", done: false },
    { id: 2, title: "Practice DBMS queries", done: false },
    { id: 3, title: "Study Operating Systems", done: true }
  ]);

  const [newTask, setNewTask] = useState("");
  const [studyMinutes, setStudyMinutes] = useState(0);

  const subjects = savedProfile.subjects
    ? savedProfile.subjects.split(",").map(s => s.trim()).filter(Boolean)
    : ["Data Structures", "DBMS", "Operating Systems"];

  const completedTasks = tasks.filter(task => task.done).length;

  const addTask = (e) => {
    e.preventDefault();

    if (!newTask.trim()) return;

    setTasks([
      ...tasks,
      {
        id: Date.now(),
        title: newTask,
        done: false
      }
    ]);

    setNewTask("");
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, done: !task.done } : task
    ));
  };

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  return (
    <div className="dashboard-container">

      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <h2>Study<span>Room.</span></h2>

        <p className="sidebar-label">MENU</p>

        <a href="#overview" className="active">▦ Dashboard</a>
        <a href="#subjects">▤ My Subjects</a>
        <a href="#planner">☑ Study Planner</a>
        <a href="#tracker">◷ Study Tracker</a>

        <div className="sidebar-bottom">
          <a href="/profile">⚙ Profile</a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">

        <header className="dashboard-header">
          <div>
            <p className="dashboard-date">{today}</p>
            <h1>
              Welcome back, {savedProfile.fullName || "Student"}!
            </h1>
            <p className="dashboard-subtitle">
              Ready to make today productive?
            </p>
          </div>

          <div className="profile-avatar">
            {(savedProfile.fullName || "S").charAt(0).toUpperCase()}
          </div>
        </header>

        {/* Statistics */}
        <section className="stats-grid" id="overview">

          <div className="stat-card">
            <span>📚</span>
            <p>Total Subjects</p>
            <h2>{subjects.length}</h2>
          </div>

          <div className="stat-card">
            <span>✅</span>
            <p>Completed Tasks</p>
            <h2>{completedTasks}/{tasks.length}</h2>
          </div>

          <div className="stat-card">
            <span>⏱️</span>
            <p>Study Time Today</p>
            <h2>{Math.floor(studyMinutes / 60)}h {studyMinutes % 60}m</h2>
          </div>

          <div className="stat-card">
            <span>🎯</span>
            <p>Daily Study Goal</p>
            <h2>{savedProfile.studyGoal || "3 hours"}</h2>
          </div>

        </section>

        {/* Subjects */}
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

        {/* Study Planner */}
        <section className="dashboard-section" id="planner">
          <div className="section-heading">
            <div>
              <h2>Today's Study Planner</h2>
              <p>Manage your daily study tasks</p>
            </div>
            <span className="task-count">
              {completedTasks} of {tasks.length} completed
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
            {tasks.map(task => (
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

        {/* Study Tracker */}
        <section className="dashboard-section" id="tracker">
          <div className="section-heading">
            <div>
              <h2>Study Tracker</h2>
              <p>Track your study time today</p>
            </div>
          </div>

          <div className="tracker-card">
            <div>
              <h3>{Math.floor(studyMinutes / 60)}h {studyMinutes % 60}m</h3>
              <p>Study time completed</p>
            </div>

            <button onClick={() => setStudyMinutes(studyMinutes + 30)}>
              + Add 30 Minutes
            </button>
          </div>
        </section>

      </main>
    </div>
  );
}

export default Dashboard;