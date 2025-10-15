import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Comments from './components/Comments';
import UserProfile from './components/UserProfile';
import FileUpload from './components/FileUpload';
import AdminPanel from './components/AdminPanel';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // VULNERABILITY: Storing sensitive data in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      // VULNERABILITY: Parsing untrusted JSON data
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // VULNERABILITY: Using eval() with user data
  const executeCode = (code) => {
    try {
      eval(code);
    } catch (error) {
      console.error('Error executing code:', error);
    }
  };

  return (
    <div className="container">
      <nav className="navbar">
        <Link to="/">Home</Link>
        <Link to="/login">Login</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/comments">Comments</Link>
        <Link to="/profile">Profile</Link>
        <Link to="/upload">Upload</Link>
        <Link to="/admin">Admin</Link>
      </nav>

      {/* VULNERABILITY: Displaying user data without sanitization */}
      {user && (
        <div className="user-info">
          <span dangerouslySetInnerHTML={{__html: `Welcome, ${user.name}!`}} />
        </div>
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/dashboard" element={<Dashboard user={user} />} />
        <Route path="/comments" element={<Comments />} />
        <Route path="/profile" element={<UserProfile user={user} />} />
        <Route path="/upload" element={<FileUpload />} />
        <Route path="/admin" element={<AdminPanel user={user} executeCode={executeCode} />} />
      </Routes>
    </div>
  );
}

function Home() {
  // VULNERABILITY: Exposing sensitive information in console
  console.log('API Key:', process.env.REACT_APP_API_KEY || 'sk-default-key-123');
  
  return (
    <div>
      <h1>Welcome to Vulnerable React App</h1>
      <p>This application contains intentional security vulnerabilities for educational purposes.</p>
      
      {/* VULNERABILITY: Hardcoded sensitive information */}
      <div style={{display: 'none'}}>
        Database: mongodb://admin:password123@localhost:27017/vulnapp
      </div>
    </div>
  );
}

export default App;