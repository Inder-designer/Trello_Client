import React, { createContext, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'sonner';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children, user }) => {
    const socketRef = useRef(null);

    useEffect(() => {
        if (!user?._id) return;
        // Initialize socket only once
        if (!socketRef.current) {
            socketRef.current = io('http://localhost:5002', {
                withCredentials: true,
            });
        }
        const socket = socketRef.current;
        socket.connect();
        socket.emit('join-room', user._id);

        socket.on('join-request', (data) => {
            toast.info(`${data.newMember.name} joined your board "${data.boardTitle}"`);
        });

        return () => {
            socket.off('join-request');
            socket.disconnect();
            socketRef.current = null;
        };
    }, [user]);

    return (
        React.createElement(SocketContext.Provider, { value: socketRef.current }, children)
    );
};
