import React, { useState } from 'react';
import axios from 'axios';

function FileUpload() {
  const [files, setFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleFileSelect = (e) => {
    // VULNERABILITY: No file type or size validation
    setFiles(Array.from(e.target.files));
  };

  const uploadFiles = async () => {
    if (files.length === 0) {
      setUploadStatus('Please select files to upload');
      return;
    }

    const formData = new FormData();
    
    // VULNERABILITY: Uploading files without validation
    files.forEach((file, index) => {
      formData.append(`file${index}`, file);
    });

    // VULNERABILITY: Adding user-controlled data to form
    formData.append('userId', localStorage.getItem('userId') || '1');
    formData.append('uploadPath', document.getElementById('uploadPath')?.value || '../uploads/');

    try {
      const response = await axios.post('http://localhost:3001/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          // VULNERABILITY: Token in header without proper validation
          'Authorization': localStorage.getItem('token')
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadStatus(`Uploading: ${percentCompleted}%`);
        }
      });

      if (response.data.success) {
        setUploadStatus('Files uploaded successfully!');
        setUploadedFiles(response.data.files);
        setFiles([]);
      }
    } catch (error) {
      // VULNERABILITY: Exposing detailed error information
      setUploadStatus('Upload failed: ' + (error.response?.data?.message || error.message));
      console.error('Upload error:', error);
    }
  };

  const downloadFile = (filename) => {
    // VULNERABILITY: Direct file access without authorization
    const downloadUrl = `http://localhost:3001/api/download/${filename}`;
    window.open(downloadUrl, '_blank');
  };

  const deleteFile = async (filename) => {
    try {
      // VULNERABILITY: File deletion without proper authorization
      const response = await axios.delete(`http://localhost:3001/api/files/${filename}`, {
        headers: {
          'Authorization': localStorage.getItem('token')
        }
      });

      if (response.data.success) {
        setUploadedFiles(prev => prev.filter(file => file.filename !== filename));
        setUploadStatus('File deleted successfully');
      }
    } catch (error) {
      setUploadStatus('Delete failed: ' + error.message);
    }
  };

  const executeUploadedFile = async (filename) => {
    try {
      // VULNERABILITY: Executing uploaded files without validation
      const response = await axios.post('http://localhost:3001/api/execute', {
        filename: filename,
        // VULNERABILITY: Client-side execution parameters
        executeAsAdmin: document.getElementById('executeAsAdmin')?.checked || false
      }, {
        headers: {
          'Authorization': localStorage.getItem('token')
        }
      });

      setUploadStatus('Execution result: ' + response.data.output);
    } catch (error) {
      setUploadStatus('Execution failed: ' + error.message);
    }
  };

  return (
    <div>
      <h2>File Upload</h2>
      
      <div className="form-group">
        <label htmlFor="fileInput">Select Files:</label>
        <input
          type="file"
          id="fileInput"
          multiple
          onChange={handleFileSelect}
          // VULNERABILITY: Accepts any file type
          accept="*/*"
        />
        
        {files.length > 0 && (
          <div style={{marginTop: '0.5rem'}}>
            <strong>Selected files:</strong>
            <ul>
              {files.map((file, index) => (
                <li key={index}>
                  {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* VULNERABILITY: User-controllable upload path */}
      <div className="form-group">
        <label htmlFor="uploadPath">Upload Path:</label>
        <input
          type="text"
          id="uploadPath"
          placeholder="../uploads/"
          defaultValue="../uploads/"
        />
        <small style={{color: '#666'}}>
          Specify where to upload the files (relative to server root)
        </small>
      </div>

      {/* VULNERABILITY: Admin execution option without proper authorization */}
      <div className="form-group">
        <label>
          <input type="checkbox" id="executeAsAdmin" />
          Execute with admin privileges
        </label>
      </div>

      <button onClick={uploadFiles} className="btn" disabled={files.length === 0}>
        Upload Files
      </button>

      {uploadStatus && (
        <div className={uploadStatus.includes('success') ? 'alert alert-success' : 'alert alert-error'}>
          {/* VULNERABILITY: Rendering status without sanitization */}
          <span dangerouslySetInnerHTML={{__html: uploadStatus}} />
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div style={{marginTop: '2rem'}}>
          <h3>Uploaded Files</h3>
          <div>
            {uploadedFiles.map((file, index) => (
              <div key={index} style={{
                background: '#f8f9fa',
                padding: '1rem',
                marginBottom: '0.5rem',
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <strong>{file.filename}</strong>
                  <br />
                  <small>
                    Size: {file.size} bytes | 
                    Type: {file.mimetype} | 
                    Path: {file.path}
                  </small>
                </div>
                <div>
                  <button 
                    onClick={() => downloadFile(file.filename)}
                    className="btn"
                    style={{margin: '0 0.25rem'}}
                  >
                    Download
                  </button>
                  <button 
                    onClick={() => executeUploadedFile(file.filename)}
                    className="btn"
                    style={{margin: '0 0.25rem', backgroundColor: 'orange'}}
                  >
                    Execute
                  </button>
                  <button 
                    onClick={() => deleteFile(file.filename)}
                    style={{
                      background: 'red',
                      color: 'white',
                      border: 'none',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      margin: '0 0.25rem'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VULNERABILITY: Exposing system information */}
      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        background: '#f0f0f0',
        borderRadius: '4px',
        fontSize: '0.8rem'
      }}>
        <strong>System Info:</strong>
        <p>Upload Directory: /var/www/uploads/</p>
        <p>Max File Size: 10MB</p>
        <p>Server: nginx/1.18.0</p>
        <p>PHP Version: 7.4.3</p>
      </div>
    </div>
  );
}

export default FileUpload;