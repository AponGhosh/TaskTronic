import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Task from './components/Task';


function App() {
  const headStyle = {
    textAlign: "center",
  }
  return (
    <Router>
      <div>
        <h1 style={headStyle}>Task Tronic</h1>
        <Routes>
          <Route path='/' element={<Task/>}></Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;