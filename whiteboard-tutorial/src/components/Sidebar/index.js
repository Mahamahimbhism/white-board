import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import './index.min.css';
import { useNavigate } from 'react-router-dom';
import boardContext from '../../store/board-context';

const Sidebar = () => {
  const [canvases, setCanvases] = useState([]);
  const token = localStorage.getItem('whiteboard_user_token');
  const { canvasId, setCanvasId, setElements, setHistory, isUserLoggedIn, setUserLoginStatus} = useContext(boardContext);
  const navigate = useNavigate();


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
      
      if (response.data.length === 0) {
        const newCanvas = await handleCreateCanvas();
        if (newCanvas) {
          setCanvasId(newCanvas._id);
          setElements(newCanvas.elements);
          setHistory(newCanvas.elements);
        }
      } else if (!canvasId && response.data.length > 0) {
        setCanvasId(response.data[0]._id);
        setElements(response.data[0].elements);
        setHistory(response.data[0].elements);
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
      setCanvasId(response.data.canvasId);
      setElements([]);
      fetchCanvases();
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
    } catch (error) {
      console.error('Error deleting canvas:', error);
    }
  };

  const handleCanvasClick = async (id) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/canvas/load/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCanvasId(id);
      setElements(response.data.elements);
      setHistory(response.data.elements);
    } catch (error) {
      console.error('Error loading canvas:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('whiteboard_user_token');
    setCanvases([]);
    setUserLoginStatus(false);
    window.location.reload();
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <button 
        className="create-button" 
        onClick={handleCreateCanvas} 
        disabled={!isUserLoggedIn}
      >
        + Create New Canvas
      </button>
      <ul className="canvas-list">
        {canvases.map(canvas => (
          <li 
            key={canvas._id} 
            className={`canvas-item ${canvas._id === canvasId ? 'selected' : ''}`}
          >
            <span 
              className="canvas-name" 
              onClick={() => handleCanvasClick(canvas._id)}
            >
              {canvas._id}
            </span>
            <button className="delete-button" onClick={() => handleDeleteCanvas(canvas._id)}>
              del
            </button>
          </li>
        ))}
      </ul>
      {isUserLoggedIn ? (
        <button className="auth-button logout-button" onClick={handleLogout}>
          Logout
        </button>
      ) : (
        <button className="auth-button login-button" onClick={handleLogin}>
          Login
        </button>
      )}
    </div>
  );
};

export default Sidebar;
