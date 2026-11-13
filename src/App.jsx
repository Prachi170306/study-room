
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'

import { ChatPage } from './features/chat'
import { TasksPage } from './features/tasks'
import { NotificationsPage } from './features/notifications'
import {FocusRoom} from './features/focus'
import {ProgressRoom} from './features/progress'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/chat" element={<ChatPage />} />

        <Route path="/tasks" element={<TasksPage />} />

        <Route
          path="/notifications"
          element={<NotificationsPage />}
        />

        <Route
          path="/"
          element={<Navigate to="/chat" replace />}
        />

        <Route
          path="*"
          element={<Navigate to="/chat" replace />}
        />

        <Route
          path="/focus"
          element = {<FocusRoom/>}
        />

        <Route
          path="/progress"
          element= {<ProgressRoom/>}
        />

      </Routes>
    </BrowserRouter>
  )
}
