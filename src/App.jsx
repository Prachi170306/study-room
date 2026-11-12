
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import { ChatPage } from './features/chat'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Chat page */}
        <Route path="/chat" element={<ChatPage />} />

        {/* Redirect home to Chat for now */}
        <Route path="/" element={<Navigate to="/chat" replace />} />

        {/* Handle invalid routes */}
        <Route path="*" element={<Navigate to="/chat" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
