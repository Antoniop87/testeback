import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Client from './Pages/Client';
import Home from './Pages/Home';
import Teacher from './Pages/Teacher'

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/Client' element={<Client/>}/>
        <Route path='/Teacher' element={<Teacher/>}/>
      </Routes>
    </Router>
  );
}

export default App;
