import React, { useState } from 'react';
import axios from 'axios';

function Login({ setUser }) {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // VULNERABILITY: Sending credentials over HTTP instead of HTTPS
      const response = await axios.post('http://localhost:3001/api/login', credentials);
      
      if (response.data.success) {
        const userData = response.data.user;
        
        // VULNERABILITY: Storing JWT token in localStorage (vulnerable to XSS)
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setUser(userData);
        setMessage('Login successful!');
        
        // VULNERABILITY: Logging sensitive information
        console.log('User logged in:', userData);
        console.log('JWT Token:', response.data.token);
      } else {
        setMessage('Login failed: ' + response.data.message);
      }
    } catch (error) {
      // VULNERABILITY: Exposing internal error details
      setMessage('Error: ' + (error.response?.data?.message || error.message));
      console.error('Full error object:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // VULNERABILITY: No CSRF protection
  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={credentials.username}
            onChange={handleChange}
            required
            // VULNERABILITY: No input validation or sanitization
            autoComplete="username"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            required
            // VULNERABILITY: Password field allows autocomplete
            autoComplete="current-password"
          />
        </div>
        
        <button type="submit" className="btn">Login</button>
      </form>
      
      {/* VULNERABILITY: Using dangerouslySetInnerHTML with unsanitized user input */}
      {message && (
        <div 
          className={message.includes('successful') ? 'alert alert-success' : 'alert alert-error'}
          dangerouslySetInnerHTML={{__html: message}}
        />
      )}
      
      {/* VULNERABILITY: Hardcoded test credentials exposed */}
      <div style={{marginTop: '2rem', fontSize: '0.8rem', color: '#666'}}>
        <p>Test credentials:</p>
        <p>Username: admin, Password: admin123</p>
        <p>Username: user, Password: password</p>
      </div>
    </div>
  );
}

export default Login;