
import { useState } from 'react'
import useConversations from '../hooks/useConversations'

import ChatSidebar from '../components/ChatSidebar'
import ChatWindow from '../components/ChatWindow'
import NewChatModal from '../components/NewChatModal'
import CreateGroupModal from '../components/CreateGroupModal'

export default function ChatPage() {
  const {
    conversations,
    selectedConversation,
    selectedId,
    search,
    setSearch,
    students,
    selectConversation,
    sendMessage,
    createPersonalChat,
    createGroup,
  } = useConversations()

  const [modal, setModal] = useState(null)
  const [showChatList, setShowChatList] = useState(true)

  function handleSelect(id) {
    selectConversation(id)
    setShowChatList(false)
  }

  return (
    <div className="max-w-7xl mx-auto">

      <div className="mb-5">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
          StudySphere Chat 💬
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Connect, discuss and learn together.
        </p>
      </div>

      <div className="h-[calc(100vh-170px)] min-h-[500px] bg-white rounded-2xl overflow-hidden border border-slate-200 flex shadow-sm">

        <div className={`w-full md:w-80 shrink-0 ${
          showChatList ? 'flex' : 'hidden md:flex'
        }`}>
          <ChatSidebar
            conversations={conversations}
            selectedId={selectedId}
            onSelect={handleSelect}
            search={search}
            setSearch={setSearch}
            onNewChat={() => setModal('personal')}
            onNewGroup={() => setModal('group')}
          />
        </div>

        <div className={`flex-1 min-w-0 ${
          showChatList ? 'hidden md:flex' : 'flex'
        }`}>
          <ChatWindow
            conversation={selectedConversation}
            onSend={sendMessage}
            onBack={() => setShowChatList(true)}
          />
        </div>
      </div>

      {modal === 'personal' && (
        <NewChatModal
          onClose={() => setModal(null)}
          onCreate={createPersonalChat}
        />
      )}

      {modal === 'group' && (
        <CreateGroupModal
          students={students}
          onClose={() => setModal(null)}
          onCreate={createGroup}
        />
      )}
    </div>
  )
}
