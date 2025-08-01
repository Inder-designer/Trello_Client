import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { Outlet } from 'react-router';
import { useGetAllBoardsQuery } from '@/redux/api/Board';
import { socket } from '@/utils/socket';
import { useSelector } from 'react-redux';
import { useBoardSocket } from '@/hooks/useBoardSocket';
import { useCardSocket } from '@/hooks/UseCardSocket';
import { IUser } from '@/Types/IUser';
import NotificationListener from '@/NotificationListener';

export interface Member {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role?: 'admin' | 'member';
}

export interface Label {
    id: string;
    name: string;
    color: string;
}

export interface Comment {
    id: string;
    text: string;
    authorId: string;
    createdAt: Date;
}

export interface Activity {
    id: string;
    type: 'moved' | 'created' | 'updated' | 'assigned' | 'commented';
    description: string;
    authorId: string;
    createdAt: Date;
    fromList?: string;
    toList?: string;
}

export interface Card {
    id: string;
    title: string;
    description?: string;
    assignedTo?: string[];
    labels: Label[];
    position: number;
    dueDate?: Date;
    startDate?: Date;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    reporterId?: string;
    comments: Comment[];
    activities: Activity[];
}

export interface List {
    id: string;
    title: string;
    cards: Card[];
    position: number;
}

export interface Board {
    id: string;
    title: string;
    description?: string;
    color: string;
    lists: List[];
    members: Member[];
}

const Layout = () => {
    const user = useSelector((state: { auth: { user: IUser | null } }) => state.auth.user);
    const { data } = useGetAllBoardsQuery({})

    useEffect(() => {
        if (user && (data?.ownedBoards?.length || data?.memberBoards?.length)) {
            const payload = {
                userId: user._id,
                ownedBoards: data.ownedBoards?.map((b) => b._id) || [],
                memberBoards: data.memberBoards?.map((b) => b._id) || [],
            };

            socket.emit("joinAllBoards", payload);
            console.log("Joined all board rooms:", payload);

            return () => {
                // Optional: leave all rooms on unmount if needed
                payload.ownedBoards.forEach((boardId) => {
                    socket.emit("leaveBoardRoom", {
                        boardId,
                        userId: user._id,
                        isOwner: true,
                    });
                });

                payload.memberBoards.forEach((boardId) => {
                    socket.emit("leaveBoardRoom", {
                        boardId,
                        userId: user._id,
                        isOwner: false,
                    });
                });
            };
        }
    }, [user?._id, data?.ownedBoards, data?.memberBoards]);

    const boardIds = [
        ...(data?.ownedBoards?.map((b) => b._id) || []),
        ...(data?.memberBoards?.map((b) => b._id) || []),
    ]
    // Custom hooks
    useBoardSocket(boardIds);
    useCardSocket(boardIds);

    return (
        <>
            <NotificationListener />
            <div className="flex h-screen bg-gray-50">
                <Sidebar />
                <div className='w-full'>
                    <Outlet />
                </div>
            </div>
        </>
    );
};

export default Layout;