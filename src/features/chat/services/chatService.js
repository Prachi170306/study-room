
const students = [
  { id: 'u1', name: 'Priya Sharma' },
  { id: 'u2', name: 'Rahul Verma' },
  { id: 'u3', name: 'Aarav Singh' },
  { id: 'u4', name: 'Ananya Gupta' },
]

const initialConversations = [
  {
    id: 'c1',
    name: 'DSA Study Group',
    type: 'group',
    members: ['Priya Sharma', 'Rahul Verma', 'Aarav Singh'],
    unread: 2,
    messages: [
      {
        id: 'm1',
        sender: 'Aarav Singh',
        text: 'Hey everyone! Ready for DSA?',
        time: '10:30 AM',
        mine: false,
      },
      {
        id: 'm2',
        sender: 'You',
        text: 'Yes! Let’s start.',
        time: '10:32 AM',
        mine: true,
      },
      {
        id: 'm3',
        sender: 'Priya Sharma',
        text: 'Anyone completed today’s task?',
        time: '10:42 AM',
        mine: false,
      },
    ],
  },
  {
    id: 'c2',
    name: 'Priya Sharma',
    type: 'personal',
    members: ['Priya Sharma'],
    unread: 1,
    messages: [
      {
        id: 'm4',
        sender: 'Priya Sharma',
        text: 'Can you share your notes?',
        time: '11:00 AM',
        mine: false,
      },
    ],
  },
  {
    id: 'c3',
    name: 'Rahul Verma',
    type: 'personal',
    members: ['Rahul Verma'],
    unread: 0,
    messages: [
      {
        id: 'm5',
        sender: 'Rahul Verma',
        text: 'Let’s study at 5!',
        time: 'Yesterday',
        mine: false,
      },
    ],
  },
  {
    id: 'c4',
    name: 'Web Development Group',
    type: 'group',
    members: ['Rahul Verma', 'Ananya Gupta'],
    unread: 0,
    messages: [
      {
        id: 'm6',
        sender: 'You',
        text: 'Shared the project link.',
        time: 'Monday',
        mine: true,
      },
    ],
  },
]

export function getDemoConversations() {
  return initialConversations
}

export function getDemoStudents() {
  return students
}
