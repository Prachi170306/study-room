import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

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
import { RoomPage, StudyRoom } from "./features/studyroom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default route */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/onboarding" element={<Onboarding />} />

        {/* Dashboard with shared layout */}
        <Route path="/dashboard" element={<Dashboard />}>
          <Route path="resources" element={<ResourceLibrary />} />
          <Route path="doubts" element={<DoubtCorner />} />
        </Route>

        <Route path="/profile" element={<Profile />} />

        {/* Team features */}
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/focus" element={<FocusRoom />} />

        {/* Study Rooms */}
        <Route path="/studyroom" element={<StudyRoom />} />
        <Route path="/study-room/:roomId" element={<RoomPage />} />

        {/* Unknown routes */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;