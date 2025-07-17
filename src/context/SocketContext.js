import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [connectionStats, setConnectionStats] = useState({});

  useEffect(() => {
    const SOCKET_URL = process.env.REACT_APP_API_URL || 'https://digasater-backend.onrender.com/';
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket'],
      upgrade: false
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    newSocket.on('connection_stats', (stats) => {
      setConnectionStats(stats);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const joinDisasterRoom = (disasterId) => {
    if (socket && connected) {
      socket.emit('join_disaster_room', disasterId);
    }
  };

  const leaveDisasterRoom = (disasterId) => {
    if (socket && connected) {
      socket.emit('leave_disaster_room', disasterId);
    }
  };

  const joinLocationRoom = (location) => {
    if (socket && connected) {
      socket.emit('join_location_room', location);
    }
  };

  const leaveLocationRoom = (location) => {
    if (socket && connected) {
      socket.emit('leave_location_room', location);
    }
  };

  const value = {
    socket,
    connected,
    connectionStats,
    joinDisasterRoom,
    leaveDisasterRoom,
    joinLocationRoom,
    leaveLocationRoom
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
