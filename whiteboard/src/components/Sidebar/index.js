import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import './index.min.css';
import { useNavigate } from 'react-router-dom';
import boardContext from '../../store/board-context';
import { useParams } from 'react-router-dom';


const Sidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [canvases, setCanvases] = useState([]);
  const token = localStorage.getItem('whiteboard_user_token');
  const { canvasId, setCanvasId, setElements, setHistory, isUserLoggedIn, setUserLoginStatus } = useContext(boardContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { id } = useParams();

  useEffect(() => {
    if (isUserLoggedIn) {
      fetchCanvases();
    }
  }, [isUserLoggedIn]);

  const fetchCanvases = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/canvas/list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCanvases(response.data);
      console.log(response.data)

      if (response.data.length === 0) {
        const newCanvas = await handleCreateCanvas();
        if (newCanvas) {
          setCanvasId(newCanvas._id);
          handleCanvasClick(newCanvas._id);
        }
      } else if (!canvasId && response.data.length > 0) {
        if (!id) {
          setCanvasId(response.data[0]._id);
          handleCanvasClick(response.data[0]._id);
        }
      }
    } catch (error) {
      console.error('Error fetching canvases:', error);
    }
  };

  const handleCreateCanvas = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/canvas/create', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(response.data)
      fetchCanvases();
      setCanvasId(response.data.canvasId);
      handleCanvasClick(response.data.canvasId);
    } catch (error) {
      console.error('Error creating canvas:', error);
      return null;
    }
  };

  const handleDeleteCanvas = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/canvas/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCanvases();
      setCanvasId(canvases[0]._id);
      handleCanvasClick(canvases[0]._id);
    } catch (error) {
      console.error('Error deleting canvas:', error);
    }
  };

  const handleCanvasClick = async (id) => {
    navigate(`/canvas/${id}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('whiteboard_user_token');
    setCanvases([]);
    setUserLoginStatus(false);
    setElements([]);  // Clear the canvas elements
    setCanvasId(null);  // Clear the current canvas ID
    navigate('/');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleShare = async () => {
    if (!email.trim()) {
      setError("Please enter an email.");
      return;
    }

    try {
      setError(""); // Clear previous errors
      setSuccess(""); // Clear previous success message

      const response = await axios.put(
        `http://localhost:5000/api/canvas/share/${canvasId}`,
        { email },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess(response.data.message);
      setTimeout(() => {
        setSuccess("");
      }, 5000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to share canvas.");
      setTimeout(() => {
        setError("");
      }, 5000);
    }
  };

  const openSidebar = () => {
    setSidebarOpen(true);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const sidebar = () => {
    return (<div className="sidebar">
      <button
        className="create-button"
        onClick={handleCreateCanvas}
        disabled={!isUserLoggedIn}
      >
        + Create New Canvas
      </button>
      <ul className="canvas-list">
        {<ul className="canvas-list">
        {(() => {
          const items = [];
          for (let i = 0; i < canvases.length; i++) {
            const canvas = canvases[i];
            items.push(
              <li
                key={canvas._id}
                className={`canvas-item ${canvas._id === canvasId ? 'selected' : ''}`}
              >
                <button
                  className="canvas-name"
                  onClick={() => handleCanvasClick(canvas._id)}
                >
                  Canvas {i + 1}
                </button>
                <button className="delete-button" onClick={() => handleDeleteCanvas(canvas._id)}>
                  Delete
                </button>
              </li>
            );
          }
          return items;
        })()}
      </ul>}
      </ul>

      <button className="close-button" onClick={closeSidebar}>
        Close Sidebar
      </button>

      <div className="share-container">
        <input
          type="email"
          placeholder="Enter the email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="share-button" onClick={handleShare} disabled={!isUserLoggedIn}>
          Share
        </button>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
      </div>
      {isUserLoggedIn ? (
        <button className="auth-button logout-button" onClick={handleLogout}>
          Logout
        </button>
      ) : (
        <button className="auth-button login-button" onClick={handleLogin}>
          Login
        </button>
      )}
    </div>);
  }

  return (
    <>
      {sidebarOpen ? sidebar() : <button className="open-sidebar-button" onClick={openSidebar}>☰ Open Sidebar</button>}
    </>
  );
};

export default Sidebar;
