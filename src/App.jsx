
import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase/config";

// Authentication and profile pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";

import ResourceLibrary from "./features/resources/pages/ResourceLibrary";
import DoubtCorner from "./features/doubts/pages/DoubtCorner";

// Team features
import { ChatPage } from "./features/chat";
import { TasksPage } from "./features/tasks";
import { NotificationsPage } from "./features/notifications";
import { FocusRoom } from "./features/focus";
import { ProgressRoom } from "./features/progress";
import { RoomPage, StudyRoom } from "./features/studyroom";

// Protected route with email verification
function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        if (active) {
          setUser(null);
          setChecking(false);
        }
        return;
      }

      try {
        await currentUser.reload();

        if (!currentUser.emailVerified) {
          await signOut(auth);

          if (active) {
            setUser(null);
            setChecking(false);
          }
          return;
        }

        if (active) {
          setUser(currentUser);
          setChecking(false);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);

        await signOut(auth);

        if (active) {
          setUser(null);
          setChecking(false);
        }
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#11111b] flex items-center justify-center text-white">
        Checking authentication...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default route */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* Public authentication routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Dashboard with shared layout */}
        <Route path="/dashboard" element={<Dashboard />}>
          <Route path="resources" element={<ResourceLibrary />} />
          <Route path="doubts" element={<DoubtCorner />} />
        </Route>

        <Route path="/profile" element={<Profile />} />
        {/* Protected onboarding */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />

        {/* Protected dashboard and profile */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          <Route path="resources" element={<ResourceLibrary />} />
          <Route path="doubts" element={<DoubtCorner />} />
        </Route>

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Protected team features */}
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <TasksPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/focus"
          element={
            <ProtectedRoute>
              <FocusRoom />
            </ProtectedRoute>
          }
        />

        {/* Protected progress dashboard */}
        <Route
          path="/progress"
          element={
            <ProtectedRoute>
              <ProgressRoom />
            </ProtectedRoute>
          }
        />

        {/* Protected study rooms */}
        <Route
          path="/studyroom"
          element={
            <ProtectedRoute>
              <StudyRoom />
            </ProtectedRoute>
          }
        />

        <Route
          path="/study-room/:roomId"
          element={
            <ProtectedRoute>
              <RoomPage />
            </ProtectedRoute>
          }
        />

        {/* Unknown routes */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
