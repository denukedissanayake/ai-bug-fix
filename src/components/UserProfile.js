import React, { useState } from 'react';
import axios from 'axios';

function UserProfile({ user }) {
  const [profile, setProfile] = useState(user || {});
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    
    try {
      // VULNERABILITY: No input validation or sanitization
      const token = localStorage.getItem('token');
      const response = await axios.put('http://localhost:3001/api/profile', {
        ...profile,
        // VULNERABILITY: Including token in request body
        token: token
      });

      if (response.data.success) {
        // VULNERABILITY: Storing updated user data without validation
        localStorage.setItem('user', JSON.stringify(profile));
        setMessage('Profile updated successfully!');
        setIsEditing(false);
      }
    } catch (error) {
      setMessage('Error updating profile: ' + error.message);
    }
  };

  const uploadProfilePicture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // VULNERABILITY: No file type validation
    const formData = new FormData();
    formData.append('profilePicture', file);
    formData.append('userId', profile.id);

    try {
      const response = await axios.post('http://localhost:3001/api/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          // VULNERABILITY: Sending token in headers without proper validation
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        setProfile(prev => ({
          ...prev,
          profilePicture: response.data.profilePicture
        }));
        setMessage('Profile picture updated!');
      }
    } catch (error) {
      setMessage('Error uploading picture: ' + error.message);
    }
  };

  const deleteAccount = async () => {
    // VULNERABILITY: No proper confirmation or security checks
    const confirmDelete = window.confirm('Are you sure you want to delete your account? This action cannot be undone!');
    
    if (confirmDelete) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:3001/api/user/${profile.id}?token=${token}`);
        
        // VULNERABILITY: No secure logout process
        localStorage.clear();
        window.location.href = '/';
      } catch (error) {
        setMessage('Error deleting account: ' + error.message);
      }
    }
  };

  if (!user) {
    return (
      <div>
        <h2>User Profile</h2>
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>User Profile</h2>
      
      <div className="user-profile">
        {!isEditing ? (
          <div>
            {/* VULNERABILITY: Displaying unescaped user data */}
            <h3 dangerouslySetInnerHTML={{__html: profile.name || 'No name'}} />
            <p><strong>Email:</strong> <span dangerouslySetInnerHTML={{__html: profile.email || 'No email'}} /></p>
            <p><strong>Bio:</strong> <span dangerouslySetInnerHTML={{__html: profile.bio || 'No bio'}} /></p>
            <p><strong>Website:</strong> 
              {profile.website && (
                // VULNERABILITY: Unsafe URL handling
                <a href={profile.website} target="_blank" rel="noopener">
                  {profile.website}
                </a>
              )}
            </p>
            
            {/* VULNERABILITY: Exposing sensitive user data */}
            <div style={{fontSize: '0.8rem', color: '#666', marginTop: '1rem'}}>
              <p>User ID: {profile.id}</p>
              <p>Account Created: {profile.createdAt}</p>
              <p>Last Modified: {profile.lastModified}</p>
              <p>Session ID: {profile.sessionId}</p>
            </div>

            <button onClick={() => setIsEditing(true)} className="btn">
              Edit Profile
            </button>
          </div>
        ) : (
          <form onSubmit={saveProfile}>
            <div className="form-group">
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={profile.name || ''}
                onChange={handleInputChange}
                // VULNERABILITY: No input validation
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={profile.email || ''}
                onChange={handleInputChange}
                // VULNERABILITY: No proper email validation
              />
            </div>

            <div className="form-group">
              <label htmlFor="bio">Bio:</label>
              <textarea
                id="bio"
                name="bio"
                value={profile.bio || ''}
                onChange={handleInputChange}
                rows="3"
                // VULNERABILITY: Allows HTML input without sanitization
                placeholder="You can use HTML tags here..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="website">Website:</label>
              <input
                type="url"
                id="website"
                name="website"
                value={profile.website || ''}
                onChange={handleInputChange}
                // VULNERABILITY: No URL validation
                placeholder="http://example.com"
              />
            </div>

            <button type="submit" className="btn">Save Changes</button>
            <button 
              type="button" 
              onClick={() => setIsEditing(false)}
              className="btn"
              style={{marginLeft: '1rem'}}
            >
              Cancel
            </button>
          </form>
        )}

        <div style={{marginTop: '2rem'}}>
          <h4>Profile Picture</h4>
          <input
            type="file"
            onChange={uploadProfilePicture}
            accept="*/*" // VULNERABILITY: Accepts any file type
          />
        </div>

        <div style={{marginTop: '2rem', borderTop: '1px solid #ddd', paddingTop: '1rem'}}>
          <h4 style={{color: 'red'}}>Danger Zone</h4>
          <button 
            onClick={deleteAccount}
            style={{
              backgroundColor: 'red',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Delete Account
          </button>
        </div>
      </div>

      {message && (
        <div className={message.includes('success') ? 'alert alert-success' : 'alert alert-error'}>
          {/* VULNERABILITY: Rendering message without sanitization */}
          <span dangerouslySetInnerHTML={{__html: message}} />
        </div>
      )}
    </div>
  );
}

export default UserProfile;