
const demoTasks = [
  {
    id: 't1',
    title: 'Complete Data Structures assignment',
    description: 'Solve the remaining questions on linked lists and trees.',
    subject: 'Data Structures',
    priority: 'high',
    status: 'in-progress',
    dueDate: '2026-11-15',
  },
  {
    id: 't2',
    title: 'Prepare React presentation',
    description: 'Prepare slides covering React hooks and component lifecycle.',
    subject: 'Web Development',
    priority: 'medium',
    status: 'todo',
    dueDate: '2026-11-18',
  },
  {
    id: 't3',
    title: 'Revise Operating Systems',
    description: 'Review process scheduling, deadlocks and memory management.',
    subject: 'Operating Systems',
    priority: 'high',
    status: 'todo',
    dueDate: '2026-11-14',
  },
  {
    id: 't4',
    title: 'Complete JavaScript practice',
    description: 'Practice arrays, objects and asynchronous JavaScript.',
    subject: 'JavaScript',
    priority: 'low',
    status: 'completed',
    dueDate: '2026-11-12',
  },
  {
    id: 't5',
    title: 'Read DBMS notes',
    description: 'Revise normalization and SQL queries.',
    subject: 'DBMS',
    priority: 'medium',
    status: 'in-progress',
    dueDate: '2026-11-20',
  },
]

export function getDemoTasks() {
  return demoTasks
}
