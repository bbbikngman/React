import React from "react";
import {BrowserRouter as Router, Route, Routes  } from 'react-router-dom';
import PasswordInput  from "./components/PasswordInput.jsx";
import ChatRoom from './components/ChatRoom.jsx'

const App = () => {
  return (
    <Router>
      <Routes >
        <Route exact path = "/" element={<PasswordInput/>} />
        <Route path="/chat" element={<ChatRoom/>} />
      </Routes >
    </Router>
  );
};
export default App;