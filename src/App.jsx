
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'

import { ChatPage } from './features/chat'
import { TasksPage } from './features/tasks'
import { NotificationsPage } from './features/notifications'
import DoubtCorner from './features/doubts/pages/DoubtCorner'
import ResourceLibrary from './features/resources/pages/ResourceLibrary'
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
        <Route path="/resources" element={<ResourceLibrary />} />
         <Route path="/doubts" element={<DoubtCorner />} />
        <Route
          path="/"
          element={<Navigate to="/chat" replace />}
        />

        <Route
          path="*"
          element={<Navigate to="/chat" replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}
