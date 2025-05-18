
import './App.css'
import AmbientPlayer from './components/AmbientPlayer/AmbientPlayer';
import Pomodoro from './components/Pomodoro/Pomodoro';
import TaskList from './components/TaskList/TaskList';


function App() {
  return (
    <div className="App">
      <Pomodoro />
      <TaskList />
    </div>
    );
}

export default App;
