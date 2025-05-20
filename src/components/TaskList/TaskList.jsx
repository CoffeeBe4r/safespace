import { useState, useEffect } from 'react';
import './TaskList.css';

export default function TaskList() {
  const [tasks, setTasks] = useState(() => {
    const stored = localStorage.getItem('tasks');
    return stored ? JSON.parse(stored) : [];
  });
  const [newTask, setNewTask] = useState('');
  const [isButtonPressed, setIsButtonPressed] = useState(false);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (newTask.trim() === '') return;
    setTasks([...tasks, { text: newTask, done: false }]);
    setNewTask('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setIsButtonPressed(true);
      addTask();
      setTimeout(() => setIsButtonPressed(false), 200); // Remove class after animation
    }
  };

  const toggleDone = (index) => {
    const updated = [...tasks];
    updated[index].done = !updated[index].done;
    updated.sort((a, b) => a.done - b.done); // Move completed tasks to the end
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
          onKeyDown={handleKeyDown}
        />
        <button 
          onClick={addTask} 
          className={isButtonPressed ? 'pressed' : ''}
        >
          Agregar
        </button>
      </div>
      <ul>
        {tasks.map((task, i) => (
          <li 
            key={i} 
            className={task.done ? 'done' : ''} 
            onClick={() => toggleDone(i)}
          >
            <span>{task.text}</span>
            <button onClick={(e) => {
              e.stopPropagation(); // Prevent triggering toggleDone
              deleteTask(i);
            }}>🗑️</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
