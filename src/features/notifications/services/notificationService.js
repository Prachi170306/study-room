
const demoNotifications = [
  {
    id: 'n1',
    title: 'New message received',
    message: 'Priya Sharma sent you a message in DSA Study Group.',
    type: 'message',
    time: '2 minutes ago',
    read: false,
    date: '2026-11-13',
  },
  {
    id: 'n2',
    title: 'Task deadline approaching',
    message: 'Your Operating Systems revision task is due tomorrow.',
    type: 'task',
    time: '20 minutes ago',
    read: false,
    date: '2026-11-13',
  },
  {
    id: 'n3',
    title: 'New group activity',
    message: 'Rahul Verma added a new discussion in Web Development Group.',
    type: 'group',
    time: '1 hour ago',
    read: false,
    date: '2026-11-13',
  },
  {
    id: 'n4',
    title: 'Task completed!',
    message: 'You successfully completed JavaScript practice.',
    type: 'task',
    time: '3 hours ago',
    read: true,
    date: '2026-11-12',
  },
  {
    id: 'n5',
    title: 'New message received',
    message: 'Ananya Gupta shared some React notes with you.',
    type: 'message',
    time: 'Yesterday',
    read: true,
    date: '2026-11-12',
  },
  {
    id: 'n6',
    title: 'Study group invitation',
    message: 'You have been invited to join the DBMS Study Group.',
    type: 'group',
    time: 'Yesterday',
    read: true,
    date: '2026-11-12',
  },
  {
    id: 'n7',
    title: 'Upcoming task reminder',
    message: 'Your React presentation is due in 3 days.',
    type: 'task',
    time: '2 days ago',
    read: true,
    date: '2026-11-11',
  },
]

export function getDemoNotifications() {
  return demoNotifications
}
