import { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { socket as socketInstance, ensureSocketConnection } from '@/lib/socket';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    ensureSocketConnection();
    setSocket(socketInstance);

    const onConnect = () => {
      setIsConnected(true);
      if (user) {
        socketInstance.emit('user:join', { userId: user.id, role: user.role });
      }
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    socketInstance.on('connect', onConnect);
    socketInstance.on('disconnect', onDisconnect);

    // Initial connection state
    if (socketInstance.connected) {
      onConnect();
    }

    return () => {
      socketInstance.off('connect', onConnect);
      socketInstance.off('disconnect', onDisconnect);
    };
  }, [user]);

  const emit = useCallback((event, data) => {
    if (socketInstance && socketInstance.connected) {
      socketInstance.emit(event, data);
    }
  }, []);

  const on = useCallback((event, callback) => {
    if (socketInstance) {
      socketInstance.on(event, callback);
    }
  }, []);

  const off = useCallback((event, callback) => {
    if (socketInstance) {
      socketInstance.off(event, callback);
    }
  }, []);

  return { socket, isConnected, emit, on, off };
};
