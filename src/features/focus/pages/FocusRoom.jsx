import { useState, useEffect } from "react";
import "./FocusRoom.css";

function FocusRoom() {

  const FOCUS_TIME = 25 * 60;
  const BREAK_TIME = 5 * 60;

  const [mode, setMode] = useState("focus");
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_TIME);
  const [isRunning, setIsRunning] = useState(false);

  // timer
  useEffect(() => {
    if (!isRunning) return;

    if (secondsLeft === 0) {
      setIsRunning(false);

      if (mode === "focus") {
        setMode("break");
        setSecondsLeft(BREAK_TIME);
      } else {
        setMode("focus");
        setSecondsLeft(FOCUS_TIME);
      }

      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, secondsLeft, mode]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(mode === "focus" ? FOCUS_TIME : BREAK_TIME);
  };

  // Progress percentage
  const totalTime = mode === "focus" ? FOCUS_TIME : BREAK_TIME;
  const progress = ((totalTime - secondsLeft) / totalTime) * 100;

  return (
    <div className="focus-container">
      <div className="focus-card">

        <h1>Focus Room</h1>
        <p className="subtitle">
          Study together. Stay focused.
        </p>

        <div className="mode-buttons">
          <button
            className={mode === "focus" ? "active" : ""}
            onClick={() => {
              setMode("focus");
              setSecondsLeft(FOCUS_TIME);
              setIsRunning(false);
            }}
          >
            Focus
          </button>

          <button
            className={mode === "break" ? "active" : ""}
            onClick={() => {
              setMode("break");
              setSecondsLeft(BREAK_TIME);
              setIsRunning(false);
            }}
          >
            Break
          </button>
        </div>

        <div className="circular-timer">

  <svg className="progress-ring" viewBox="0 0 260 260">
    <circle
      className="progress-ring-bg"
      cx="130"
      cy="130"
      r="115"
    />

    <circle
      className="progress-ring-fill"
      cx="130"
      cy="130"
      r="115"
      style={{
        strokeDasharray: `${2 * Math.PI * 115}`,
        strokeDashoffset: `${
          2 * Math.PI * 115 * (1 - progress / 100)
        }`
      }}
    />
  </svg>

  <div className="timer">
    {String(minutes).padStart(2, "0")}:
    {String(seconds).padStart(2, "0")}
  </div>

</div>

        <p className="timer-status">
          {mode === "focus"
            ? "Time to concentrate!"
            : "Take a little break!"}
        </p>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="timer-controls">
          <button onClick={handleStartPause}>
            {isRunning ? "Pause" : "Start"}
          </button>

          <button onClick={handleReset}>
            Reset
          </button>
        </div>

      </div>
    </div>
  );
}

export default FocusRoom;
