import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useSocket } from './SocketContext';
import { disasterService } from '../services/disasterService';

const DisasterContext = createContext();

export const useDisaster = () => {
  const context = useContext(DisasterContext);
  if (!context) {
    throw new Error('useDisaster must be used within a DisasterProvider');
  }
  return context;
};

const initialState = {
  disasters: [],
  currentDisaster: null,
  loading: false,
  error: null
};

const disasterReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_DISASTERS':
      return { ...state, disasters: Array.isArray(action.payload) ? action.payload : [], loading: false };
    case 'SET_CURRENT_DISASTER':
      return { ...state, currentDisaster: action.payload, loading: false };
    case 'ADD_DISASTER':
      return { ...state, disasters: [action.payload, ...(Array.isArray(state.disasters) ? state.disasters : [])] };
    case 'UPDATE_DISASTER':
      return {
        ...state,
        disasters: Array.isArray(state.disasters) ? state.disasters.map(d => 
          d.id === action.payload.id ? action.payload : d
        ) : [],
        currentDisaster: state.currentDisaster?.id === action.payload.id 
          ? action.payload 
          : state.currentDisaster
      };
    case 'DELETE_DISASTER':
      return {
        ...state,
        disasters: Array.isArray(state.disasters) ? state.disasters.filter(d => d.id !== action.payload) : [],
        currentDisaster: state.currentDisaster?.id === action.payload 
          ? null 
          : state.currentDisaster
      };
    default:
      return state;
  }
};

export const DisasterProvider = ({ children }) => {
  const [state, dispatch] = useReducer(disasterReducer, initialState);
  const { socket } = useSocket();

  useEffect(() => {
    if (socket) {
      socket.on('disaster_created', (disaster) => {
        dispatch({ type: 'ADD_DISASTER', payload: disaster });
      });

      socket.on('disaster_updated', (disaster) => {
        dispatch({ type: 'UPDATE_DISASTER', payload: disaster });
      });

      socket.on('disaster_deleted', (disasterId) => {
        dispatch({ type: 'DELETE_DISASTER', payload: disasterId });
      });

      return () => {
        socket.off('disaster_created');
        socket.off('disaster_updated');
        socket.off('disaster_deleted');
      };
    }
  }, [socket]);

  const fetchDisasters = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await disasterService.getAll();
      // Ensure disasters is always an array
      const disasters = Array.isArray(response) ? response : (response?.data ? response.data : []);
      dispatch({ type: 'SET_DISASTERS', payload: disasters });
    } catch (error) {
      console.error('Error fetching disasters:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to fetch disasters' });
      dispatch({ type: 'SET_DISASTERS', payload: [] }); // Fallback to empty array
    }
  };

  const fetchDisaster = async (id) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const disaster = await disasterService.getById(id);
      dispatch({ type: 'SET_CURRENT_DISASTER', payload: disaster });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const createDisaster = async (disasterData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const disaster = await disasterService.create(disasterData);
      dispatch({ type: 'ADD_DISASTER', payload: disaster });
      return disaster;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const updateDisaster = async (id, disasterData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const disaster = await disasterService.update(id, disasterData);
      dispatch({ type: 'UPDATE_DISASTER', payload: disaster });
      return disaster;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const deleteDisaster = async (id) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await disasterService.delete(id);
      dispatch({ type: 'DELETE_DISASTER', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const value = {
    ...state,
    fetchDisasters,
    fetchDisaster,
    createDisaster,
    updateDisaster,
    deleteDisaster
  };

  return (
    <DisasterContext.Provider value={value}>
      {children}
    </DisasterContext.Provider>
  );
};
