import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminPanel({ user, executeCode }) {
  const [users, setUsers] = useState([]);
  const [systemLogs, setSystemLogs] = useState([]);
  const [sqlQuery, setSqlQuery] = useState('');
  const [queryResult, setQueryResult] = useState('');
  const [customCode, setCustomCode] = useState('');

  useEffect(() => {
    // VULNERABILITY: No proper admin role verification
    if (user && user.role === 'admin') {
      fetchUsers();
      fetchSystemLogs();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      // VULNERABILITY: Admin endpoints accessible with simple token
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3001/api/admin/users?token=${token}`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchSystemLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3001/api/admin/logs?token=${token}`);
      setSystemLogs(response.data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const executeSqlQuery = async () => {
    try {
      // VULNERABILITY: Direct SQL execution without validation
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:3001/api/admin/sql', {
        query: sqlQuery,
        token: token
      });
      
      setQueryResult(JSON.stringify(response.data, null, 2));
    } catch (error) {
      setQueryResult('Error: ' + error.message);
    }
  };

  const deleteUser = async (userId) => {
    // VULNERABILITY: No confirmation or additional security checks
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3001/api/admin/users/${userId}?token=${token}`);
      fetchUsers(); // Refresh the list
    } catch (error) {
      alert('Error deleting user: ' + error.message);
    }
  };

  const promoteUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:3001/api/admin/users/${userId}/promote`, {
        token: token
      });
      fetchUsers(); // Refresh the list
    } catch (error) {
      alert('Error promoting user: ' + error.message);
    }
  };

  const clearLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3001/api/admin/logs?token=${token}`);
      setSystemLogs([]);
      alert('Logs cleared successfully');
    } catch (error) {
      alert('Error clearing logs: ' + error.message);
    }
  };

  // VULNERABILITY: Client-side admin check that can be bypassed
  if (!user || user.role !== 'admin') {
    return (
      <div>
        <h2>Admin Panel</h2>
        <div className="alert alert-error">
          Access denied. Admin privileges required.
        </div>
        {/* VULNERABILITY: Showing hint about bypassing security */}
        <small style={{color: '#666'}}>
          Hint: Try modifying your user object in localStorage...
        </small>
      </div>
    );
  }

  return (
    <div>
      <h2>Admin Panel</h2>
      
      {/* User Management Section */}
      <div style={{marginBottom: '2rem'}}>
        <h3>User Management</h3>
        <div style={{background: '#f8f9fa', padding: '1rem', borderRadius: '4px'}}>
          <table style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead>
              <tr style={{borderBottom: '1px solid #ddd'}}>
                <th style={{padding: '0.5rem', textAlign: 'left'}}>ID</th>
                <th style={{padding: '0.5rem', textAlign: 'left'}}>Username</th>
                <th style={{padding: '0.5rem', textAlign: 'left'}}>Email</th>
                <th style={{padding: '0.5rem', textAlign: 'left'}}>Role</th>
                <th style={{padding: '0.5rem', textAlign: 'left'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} style={{borderBottom: '1px solid #eee'}}>
                  <td style={{padding: '0.5rem'}}>{user.id}</td>
                  <td style={{padding: '0.5rem'}}>{user.username}</td>
                  <td style={{padding: '0.5rem'}}>{user.email}</td>
                  <td style={{padding: '0.5rem'}}>{user.role}</td>
                  <td style={{padding: '0.5rem'}}>
                    <button 
                      onClick={() => promoteUser(user.id)}
                      className="btn"
                      style={{marginRight: '0.5rem', fontSize: '0.8rem'}}
                    >
                      Promote
                    </button>
                    <button 
                      onClick={() => deleteUser(user.id)}
                      style={{
                        background: 'red',
                        color: 'white',
                        border: 'none',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SQL Query Section */}
      <div style={{marginBottom: '2rem'}}>
        <h3>Database Console</h3>
        <div className="form-group">
          <label htmlFor="sqlQuery">SQL Query:</label>
          <textarea
            id="sqlQuery"
            value={sqlQuery}
            onChange={(e) => setSqlQuery(e.target.value)}
            placeholder="Enter SQL query (e.g., SELECT * FROM users)"
            rows="3"
            style={{fontFamily: 'monospace'}}
          />
        </div>
        <button onClick={executeSqlQuery} className="btn">
          Execute Query
        </button>
        
        {queryResult && (
          <div style={{marginTop: '1rem'}}>
            <h4>Query Result:</h4>
            <pre style={{
              background: '#f8f9fa',
              padding: '1rem',
              borderRadius: '4px',
              overflow: 'auto',
              maxHeight: '300px'
            }}>
              {queryResult}
            </pre>
          </div>
        )}
      </div>

      {/* Code Execution Section */}
      <div style={{marginBottom: '2rem'}}>
        <h3>Code Execution</h3>
        <div className="form-group">
          <label htmlFor="customCode">JavaScript Code:</label>
          <textarea
            id="customCode"
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value)}
            placeholder="Enter JavaScript code to execute..."
            rows="5"
            style={{fontFamily: 'monospace'}}
          />
        </div>
        <button 
          onClick={() => executeCode(customCode)}
          className="btn"
          style={{backgroundColor: 'orange'}}
        >
          Execute Code
        </button>
        
        {/* VULNERABILITY: Pre-filled dangerous code examples */}
        <div style={{marginTop: '1rem'}}>
          <strong>Quick Examples:</strong>
          <div>
            <button 
              onClick={() => setCustomCode('alert("XSS Test")')}
              style={{margin: '0.25rem', padding: '0.25rem 0.5rem', fontSize: '0.8rem'}}
            >
              Alert Test
            </button>
            <button 
              onClick={() => setCustomCode('document.cookie')}
              style={{margin: '0.25rem', padding: '0.25rem 0.5rem', fontSize: '0.8rem'}}
            >
              Show Cookies
            </button>
            <button 
              onClick={() => setCustomCode('localStorage.clear()')}
              style={{margin: '0.25rem', padding: '0.25rem 0.5rem', fontSize: '0.8rem'}}
            >
              Clear Storage
            </button>
          </div>
        </div>
      </div>

      {/* System Logs Section */}
      <div style={{marginBottom: '2rem'}}>
        <h3>System Logs</h3>
        <button onClick={clearLogs} className="btn" style={{marginBottom: '1rem'}}>
          Clear All Logs
        </button>
        
        <div style={{
          background: '#000',
          color: '#0f0',
          padding: '1rem',
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '0.8rem',
          maxHeight: '300px',
          overflow: 'auto'
        }}>
          {systemLogs.map((log, index) => (
            <div key={index}>
              [{log.timestamp}] {log.level}: {log.message}
            </div>
          ))}
          {systemLogs.length === 0 && (
            <div>No logs available</div>
          )}
        </div>
      </div>

      {/* System Information */}
      <div style={{marginBottom: '2rem'}}>
        <h3>System Information</h3>
        <div style={{
          background: '#f8f9fa',
          padding: '1rem',
          borderRadius: '4px',
          fontSize: '0.8rem'
        }}>
          {/* VULNERABILITY: Exposing sensitive system information */}
          <p><strong>Server:</strong> Ubuntu 20.04 LTS</p>
          <p><strong>Node.js Version:</strong> v16.14.0</p>
          <p><strong>Database:</strong> SQLite 3.31.1</p>
          <p><strong>Server IP:</strong> 192.168.1.100</p>
          <p><strong>Admin Session:</strong> {localStorage.getItem('token')}</p>
          <p><strong>Environment:</strong> development</p>
          <p><strong>Debug Mode:</strong> enabled</p>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;