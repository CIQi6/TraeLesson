import React, { useState } from 'react';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import TodoList from './components/TodoList';

function App() {
  const [currentView, setCurrentView] = useState('login');
  const [user, setUser] = useState(null);

  const handleLogin = (username) => {
    setUser(username);
    setCurrentView('todo');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('login');
  };

  return (
    <div className="app-container">
      {currentView === 'login' && (
        <Login onLogin={handleLogin} onRegister={() => setCurrentView('register')} />
      )}
      {currentView === 'register' && (
        <Register onRegister={() => setCurrentView('login')} />
      )}
      {currentView === 'todo' && user && (
        <TodoList username={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;