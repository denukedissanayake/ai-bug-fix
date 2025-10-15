import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard({ user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // VULNERABILITY: Sending token in URL parameters (logged in server logs)
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3001/api/dashboard?token=${token}`);
      
      setData(response.data);
      setLoading(false);
    } catch (error) {
      // VULNERABILITY: Exposing detailed error information
      setError(error.response?.data || error.message);
      setLoading(false);
      console.error('Dashboard error:', error);
    }
  };

  const performAction = async (action) => {
    try {
      // VULNERABILITY: No input validation on action parameter
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:3001/api/action', {
        action: action,
        // VULNERABILITY: Sending sensitive data in request body
        token: token,
        userAgent: navigator.userAgent,
        timestamp: Date.now()
      });
      
      alert('Action completed: ' + response.data.message);
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  if (!user) {
    return (
      <div>
        <h2>Dashboard</h2>
        <p>Please log in to access the dashboard.</p>
      </div>
    );
  }

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div>
        <h2>Dashboard</h2>
        <div className="alert alert-error">
          {/* VULNERABILITY: Displaying raw error messages that might contain sensitive info */}
          <strong>Error loading dashboard:</strong>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2>Dashboard</h2>
      
      {/* VULNERABILITY: Exposing user object that might contain sensitive data */}
      <div className="user-profile">
        <h3>Welcome, {user.name}!</h3>
        <p>Role: {user.role}</p>
        <p>Last Login: {user.lastLogin}</p>
        
        {/* VULNERABILITY: Client-side role checking that can be bypassed */}
        {user.role === 'admin' && (
          <div style={{background: '#ffe6e6', padding: '1rem', borderRadius: '4px'}}>
            <h4>Admin Functions</h4>
            <button onClick={() => performAction('delete_all_logs')} className="btn" style={{margin: '0.25rem'}}>
              Clear Logs
            </button>
            <button onClick={() => performAction('backup_database')} className="btn" style={{margin: '0.25rem'}}>
              Backup Database
            </button>
            <button onClick={() => performAction('reset_passwords')} className="btn" style={{margin: '0.25rem'}}>
              Reset All Passwords
            </button>
          </div>
        )}
      </div>

      {/* VULNERABILITY: Displaying sensitive system information */}
      {data && (
        <div style={{marginTop: '2rem'}}>
          <h3>System Information</h3>
          <div style={{background: '#f8f9fa', padding: '1rem', borderRadius: '4px'}}>
            <p><strong>Server:</strong> {data.serverInfo}</p>
            <p><strong>Database:</strong> {data.dbConnection}</p>
            <p><strong>Active Sessions:</strong> {data.activeSessions}</p>
            <p><strong>Memory Usage:</strong> {data.memoryUsage}</p>
            
            {/* VULNERABILITY: Exposing internal API endpoints */}
            <details>
              <summary>API Endpoints</summary>
              <ul>
                {data.apiEndpoints?.map((endpoint, index) => (
                  <li key={index}>{endpoint}</li>
                ))}
              </ul>
            </details>
          </div>
        </div>
      )}

      {/* VULNERABILITY: Inline JavaScript execution */}
      <div style={{marginTop: '2rem'}}>
        <h3>Quick Actions</h3>
        <button 
          onClick={() => {
            // VULNERABILITY: eval() with potentially user-controlled data
            const userInput = prompt('Enter JavaScript code to execute:');
            if (userInput) {
              try {
                eval(userInput);
              } catch (e) {
                alert('Error: ' + e.message);
              }
            }
          }}
          className="btn"
        >
          Execute Custom Code
        </button>
      </div>
    </div>
  );
}

export default Dashboard;