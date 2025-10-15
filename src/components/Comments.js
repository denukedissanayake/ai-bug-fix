import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Comments() {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/comments');
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const addComment = async (e) => {
    e.preventDefault();
    
    try {
      // VULNERABILITY: No input validation or sanitization
      const response = await axios.post('http://localhost:3001/api/comments', {
        content: newComment,
        // VULNERABILITY: Client-side user ID that can be manipulated
        userId: localStorage.getItem('userId') || '1'
      });
      
      if (response.data.success) {
        setNewComment('');
        fetchComments();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const deleteComment = async (commentId) => {
    try {
      // VULNERABILITY: No authorization check on client side
      await axios.delete(`http://localhost:3001/api/comments/${commentId}`);
      fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  // VULNERABILITY: Client-side filtering that can be bypassed
  const filteredComments = comments.filter(comment => 
    comment.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h2>Comments Section</h2>
      
      {/* VULNERABILITY: No CSRF protection */}
      <form onSubmit={addComment}>
        <div className="form-group">
          <label htmlFor="comment">Add a comment:</label>
          <textarea
            id="comment"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Enter your comment..."
            rows="3"
            required
          />
        </div>
        <button type="submit" className="btn">Post Comment</button>
      </form>

      <div className="form-group" style={{marginTop: '2rem'}}>
        <label htmlFor="search">Search comments:</label>
        <input
          type="text"
          id="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
        />
      </div>

      <div style={{marginTop: '2rem'}}>
        <h3>Comments ({filteredComments.length})</h3>
        {filteredComments.map(comment => (
          <div key={comment.id} className="comment">
            <div>
              {/* VULNERABILITY: Rendering unsanitized HTML content (XSS) */}
              <div dangerouslySetInnerHTML={{__html: comment.content}} />
              <small style={{color: '#666'}}>
                By: {comment.username} | 
                Posted: {new Date(comment.created_at).toLocaleString()}
              </small>
            </div>
            
            {/* VULNERABILITY: No proper authorization check */}
            <button 
              onClick={() => deleteComment(comment.id)}
              style={{
                background: 'red',
                color: 'white',
                border: 'none',
                padding: '0.25rem 0.5rem',
                borderRadius: '3px',
                cursor: 'pointer',
                marginTop: '0.5rem'
              }}
            >
              Delete
            </button>
          </div>
        ))}
        
        {filteredComments.length === 0 && (
          <p>No comments found.</p>
        )}
      </div>

      {/* VULNERABILITY: Exposing sensitive debug information */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{marginTop: '2rem', padding: '1rem', background: '#f0f0f0', fontSize: '0.8rem'}}>
          <strong>Debug Info:</strong>
          <pre>{JSON.stringify({
            totalComments: comments.length,
            currentUser: localStorage.getItem('user'),
            apiEndpoint: 'http://localhost:3001/api/comments'
          }, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default Comments;