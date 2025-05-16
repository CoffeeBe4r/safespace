import { useState, useEffect } from 'react';
import './TaskList.css';

export default function TaskList() {
  const [tasks, setTasks] = useState(() => {
    const stored = localStorage.getItem('tasks');
    return stored ? JSON.parse(stored) : [];
  });
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (newTask.trim() === '') return;
    setTasks([...tasks, { text: newTask, done: false }]);
    setNewTask('');
  };

  const toggleDone = (index) => {
    const updated = [...tasks];
    updated[index].done = !updated[index].done;
    setTasks(updated);
  };

  const deleteTask = (index) => {
    const updated = [...tasks];
    updated.splice(index, 1);
    setTasks(updated);
  };

  return (
    <div className="task-list">
      <h2>Mis tareas</h2>
      <div className="task-input">
        <input
          type="text"
          placeholder="Nueva tarea..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <button onClick={addTask}>Agregar</button>
      </div>
      <ul>
        {tasks.map((task, i) => (
          <li key={i} className={task.done ? 'done' : ''}>
            <span onClick={() => toggleDone(i)}>{task.text}</span>
            <button onClick={() => deleteTask(i)}>🗑️</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
