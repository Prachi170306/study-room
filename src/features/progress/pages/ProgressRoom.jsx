
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

import { auth } from "../../../firebase/firebase";
import { getStudyHistory } from "../services/progressService";

import "./ProgressRoom.css";

function ProgressRoom() {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        if (!cancelled) {
          setError("Please log in to view your study history.");
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getStudyHistory(user.uid);

        if (!cancelled) {
          setSessions(data);
        }
      } catch (err) {
        console.error("Progress loading error:", err);

        if (!cancelled) {
          setError("Unable to load your study history.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  // ------------------------------------
  // CALCULATE GENERAL STATISTICS
  // ------------------------------------

  const totalSessions = sessions.length;

  const totalSeconds = sessions.reduce(
    (total, session) =>
      total + (Number(session.durationSeconds) || 0),
    0
  );

  const totalMinutes = Math.floor(totalSeconds / 60);

  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  // ------------------------------------
  // TODAY'S STUDY TIME
  // ------------------------------------

  const today = new Date();

  const todaySessions = sessions.filter((session) => {
    const date = session.completedAt?.toDate?.();

    if (!date) return false;

    return date.toDateString() === today.toDateString();
  });

  const todaySeconds = todaySessions.reduce(
    (total, session) =>
      total + (Number(session.durationSeconds) || 0),
    0
  );

  const todayMinutes = Math.floor(todaySeconds / 60);

  // ------------------------------------
  // WEEKLY STUDY STATISTICS
  // Monday to Sunday
  // ------------------------------------

  const getWeeklyData = () => {
    const now = new Date();
    const day = now.getDay();

    const mondayOffset = day === 0 ? 6 : day - 1;

    const monday = new Date(now);
    monday.setDate(now.getDate() - mondayOffset);
    monday.setHours(0, 0, 0, 0);

    const days = [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun"
    ];

    return days.map((dayName, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);

      const daySeconds = sessions.reduce((total, session) => {
        const completedDate = session.completedAt?.toDate?.();

        if (
          completedDate &&
          completedDate.toDateString() === date.toDateString()
        ) {
          return total + (Number(session.durationSeconds) || 0);
        }

        return total;
      }, 0);

      return {
        day: dayName,
        minutes: Math.round(daySeconds / 60),
        date
      };
    });
  };

  const weeklyData = getWeeklyData();

  // ------------------------------------
  // STUDY CONSISTENCY HEATMAP
  // Last 52 weeks (364 days)
  // ------------------------------------

  const getDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const getHeatmapData = () => {
    const today = new Date();

    // Find Monday of the current week
    const mondayOffset =
      today.getDay() === 0 ? 6 : today.getDay() - 1;

    const currentMonday = new Date(today);
    currentMonday.setDate(today.getDate() - mondayOffset);
    currentMonday.setHours(0, 0, 0, 0);

    // Start 51 weeks before current Monday
    const startDate = new Date(currentMonday);
    startDate.setDate(currentMonday.getDate() - 357);

    // Group completed sessions by date
    const activityMap = {};

    sessions.forEach((session) => {
      const completedDate = session.completedAt?.toDate?.();

      if (!completedDate) return;

      const key = getDateKey(completedDate);

      if (!activityMap[key]) {
        activityMap[key] = {
          sessions: 0,
          seconds: 0
        };
      }

      activityMap[key].sessions += 1;
      activityMap[key].seconds +=
        Number(session.durationSeconds) || 0;
    });

    // Generate 364 days = 52 columns x 7 rows
    return Array.from({ length: 364 }, (_, index) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + index);

      const activity = activityMap[getDateKey(date)] || {
        sessions: 0,
        seconds: 0
      };

      const minutes = Math.floor(activity.seconds / 60);

      let level = 0;

      if (minutes > 0 && minutes < 30) level = 1;
      else if (minutes >= 30 && minutes < 60) level = 2;
      else if (minutes >= 60 && minutes < 120) level = 3;
      else if (minutes >= 120) level = 4;

      return {
        date,
        sessions: activity.sessions,
        seconds: activity.seconds,
        minutes,
        level
      };
    });
  };

  const heatmapData = getHeatmapData();

  // ------------------------------------
  // HEATMAP MONTH LABELS
  // ------------------------------------

  const heatmapMonths = Array.from(
    { length: 52 },
    (_, weekIndex) => {
      const weekDays = heatmapData.slice(
        weekIndex * 7,
        weekIndex * 7 + 7
      );

      if (weekDays.length === 0) return "";

      if (weekIndex === 0) {
        return weekDays[0].date.toLocaleDateString("en-IN", {
          month: "short"
        });
      }

      const monthStart = weekDays.find(
        (day) => day.date.getDate() === 1
      );

      return monthStart
        ? monthStart.date.toLocaleDateString("en-IN", {
            month: "short"
          })
        : "";
    }
  );

  const maxWeeklyMinutes = Math.max(
    ...weeklyData.map((day) => day.minutes),
    1
  );

  // ------------------------------------
  // DATE AND DURATION FORMATTING
  // ------------------------------------

  const formatDate = (timestamp) => {
    if (!timestamp?.toDate) return "Date unavailable";

    return timestamp.toDate().toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatDuration = (seconds) => {
    const total = Number(seconds) || 0;
    const mins = Math.floor(total / 60);
    const secs = total % 60;

    if (mins === 0) return `${secs} sec`;

    if (secs === 0) return `${mins} min`;

    return `${mins} min ${secs} sec`;
  };

  // ------------------------------------
  // ACHIEVEMENTS
  // ------------------------------------

  // Only completed focus sessions count
  const focusSessions = sessions.filter(
    (session) => session.sessionType === "focus"
  );

  // Sort sessions from oldest to newest
  const chronologicalSessions = [...focusSessions].sort(
    (a, b) => {
      const dateA = a.completedAt?.toMillis?.() || 0;
      const dateB = b.completedAt?.toMillis?.() || 0;

      return dateA - dateB;
    }
  );

  // Calculate total completed focus time
  const focusSeconds = chronologicalSessions.reduce(
    (total, session) =>
      total + (Number(session.durationSeconds) || 0),
    0
  );

  // Achievement definitions and progress
  const achievementDefinitions = [
    {
      id: "first-focus",
      icon: "🎯",
      title: "First Focus",
      description: "Complete your first focus session.",
      target: 1,
      progress: focusSessions.length,
      earnedAt: chronologicalSessions[0]?.completedAt
    },
    {
      id: "focused-learner",
      icon: "📚",
      title: "Focused Learner",
      description: "Accumulate 60 minutes of focus time.",
      target: 3600,
      progress: focusSeconds,
      earnedAt: (() => {
        let accumulated = 0;

        for (const session of chronologicalSessions) {
          accumulated +=
            Number(session.durationSeconds) || 0;

          if (accumulated >= 3600) {
            return session.completedAt;
          }
        }

        return null;
      })()
    },
    {
      id: "consistency-champion",
      icon: "🔥",
      title: "Consistency Champion",
      description: "Complete 5 focus sessions.",
      target: 5,
      progress: focusSessions.length,
      earnedAt: chronologicalSessions[4]?.completedAt
    }
  ];

  // Format achievement unlock date
  const formatAchievementDate = (timestamp) => {
    if (!timestamp?.toDate) return "";

    return timestamp.toDate().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  // Calculate achievement progress percentage
  const getAchievementProgress = (achievement) => {
    return Math.min(
      100,
      Math.round(
        (achievement.progress / achievement.target) * 100
      )
    );
  };

  // ------------------------------------
  // LOADING STATE
  // ------------------------------------

  if (loading) {
    return (
      <div className="progress-message">
        Loading your study progress...
      </div>
    );
  }

  // ------------------------------------
  // MAIN PROGRESS DASHBOARD
  // ------------------------------------

  return (
    <div className="progress-page">

      {/* HEADER */}
      <header className="progress-header">
        <div>
          <h1>Study Progress</h1>
          <p>
            Track your focus sessions and celebrate your progress.
          </p>
        </div>

        <button onClick={() => navigate("/chat")}>
          Back to Dashboard
        </button>
      </header>

      {error && (
        <div className="progress-error">
          {error}
        </div>
      )}

      {/* STATISTICS */}
      <section className="progress-stats">

        <div className="progress-stat-card">
          <span className="stat-icon">🎯</span>
          <p>Total Focus Sessions</p>
          <h2>{totalSessions}</h2>
        </div>

        <div className="progress-stat-card">
          <span className="stat-icon">⏱️</span>
          <p>Total Study Time</p>
          <h2>
            {hours}h {remainingMinutes}m
          </h2>
        </div>

        <div className="progress-stat-card">
          <span className="stat-icon">📚</span>
          <p>Today's Study Time</p>
          <h2>{todayMinutes} min</h2>
        </div>

      </section>

      {/* STUDY CONSISTENCY HEATMAP */}
      <section className="study-heatmap-card">
        <h2>Study Consistency</h2>

        <p className="progress-subtitle">
          Your study activity over the last 52 weeks
        </p>

        <div className="heatmap-container">

          <div className="heatmap-weekdays">
            <span></span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>

          <div className="heatmap-content">

            {/* MONTH LABELS */}
            <div className="heatmap-months">
              {heatmapMonths.map((month, index) => (
                <span key={index}>{month}</span>
              ))}
            </div>

            {/* HEATMAP SQUARES */}
            <div className="heatmap-grid">
              {heatmapData.map((day, index) => (
                <div
                  key={index}
                  className={`heatmap-day level-${day.level}`}
                  title={`${day.date.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                  })} | ${day.sessions} sessions | ${formatDuration(
                    day.seconds
                  )}`}
                />
              ))}
            </div>

          </div>
        </div>

        {/* HEATMAP LEGEND */}
        <div className="heatmap-legend">
          <span>Less</span>
          <div className="legend-box level-0" />
          <div className="legend-box level-1" />
          <div className="legend-box level-2" />
          <div className="legend-box level-3" />
          <div className="legend-box level-4" />
          <span>More</span>
        </div>
      </section>

      {/* WEEKLY CHART */}
      <section className="weekly-progress-card">
        <h2>Weekly Progress</h2>

        <p className="progress-subtitle">
          Your study time from Monday to Sunday
        </p>

        <div className="weekly-chart">
          {weeklyData.map((day) => (
            <div className="weekly-bar-item" key={day.day}>
              <span className="weekly-minutes">
                {day.minutes}m
              </span>

              <div className="weekly-bar-background">
                <div
                  className="weekly-bar-fill"
                  style={{
                    height: `${
                      (day.minutes / maxWeeklyMinutes) * 100
                    }%`
                  }}
                />
              </div>

              <span className="weekly-day">
                {day.day}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ACHIEVEMENTS */}
      <section className="achievements-card">

        <div className="achievements-heading">
          <div>
            <h2>Achievements</h2>
            <p className="progress-subtitle">
              Celebrate your focus milestones and keep going!
            </p>
          </div>

          <span className="achievement-count">
            {
              achievementDefinitions.filter(
                (item) => item.progress >= item.target
              ).length
            } / 3 unlocked
          </span>
        </div>

        <div className="achievements-grid">

          {achievementDefinitions.map((achievement) => {
            const unlocked =
              achievement.progress >= achievement.target;

            const percentage =
              getAchievementProgress(achievement);

            const displayProgress =
              achievement.id === "focused-learner"
                ? `${Math.floor(
                    achievement.progress / 60
                  )} / 60 min`
                : `${Math.min(
                    achievement.progress,
                    achievement.target
                  )} / ${achievement.target} sessions`;

            return (
              <div
                className={`achievement-item ${
                  unlocked ? "unlocked" : "locked"
                }`}
                key={achievement.id}
              >

                <div className="achievement-top">
                  <div className="achievement-icon">
                    {achievement.icon}
                  </div>

                  <span className="achievement-status">
                    {unlocked ? "✓ Unlocked" : "🔒 Locked"}
                  </span>
                </div>

                <h3>{achievement.title}</h3>

                <p className="achievement-description">
                  {achievement.description}
                </p>

                <div className="achievement-progress-info">
                  <span>{displayProgress}</span>
                  <span>{percentage}%</span>
                </div>

                <div className="achievement-progress-background">
                  <div
                    className="achievement-progress-fill"
                    style={{
                      width: `${percentage}%`
                    }}
                  />
                </div>

                {unlocked && achievement.earnedAt && (
                  <p className="achievement-earned-date">
                    Earned on{" "}
                    {formatAchievementDate(
                      achievement.earnedAt
                    )}
                  </p>
                )}

                {!unlocked && (
                  <p className="achievement-remaining">
                    Keep studying to unlock!
                  </p>
                )}

              </div>
            );
          })}

        </div>
      </section>

      {/* SESSION HISTORY */}
      <section className="study-history-card">

        <div className="history-heading">
          <div>
            <h2>Study History</h2>
            <p className="progress-subtitle">
              Your completed Focus sessions
            </p>
          </div>

          <span className="history-count">
            {totalSessions} sessions
          </span>
        </div>

        {sessions.length === 0 ? (
          <div className="empty-history">
            <span>📖</span>
            <h3>No study sessions yet</h3>
            <p>
              Complete a Focus session in a study room
              to see your progress here.
            </p>
          </div>
        ) : (
          <div className="history-list">

            {sessions.map((session) => (
              <div
                className="history-item"
                key={session.id}
              >

                <div className="history-icon">
                  🎯
                </div>

                <div className="history-details">
                  <h3>
                    {session.roomName || "Study Room"}
                  </h3>

                  <p>
                    {formatDate(session.completedAt)}
                  </p>
                </div>

                <div className="history-duration">
                  {formatDuration(session.durationSeconds)}
                </div>

              </div>
            ))}

          </div>
        )}

      </section>

    </div>
  );
}

export default ProgressRoom;
