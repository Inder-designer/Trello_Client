import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import BoardView from '@/components/BoardView';
import AllBoardsView from '@/components/AllBoardsView';
import { Outlet } from 'react-router';
import { useGetAllBoardsQuery } from '@/redux/api/Board';
import useSocket from '@/hooks/useSocket';

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
    useSocket();
    const { data } = useGetAllBoardsQuery({})

    const [currentBoard, setCurrentBoard] = useState<Board>({
        id: '1',
        title: 'Project Management Board',
        description: 'Main project tracking board',
        color: 'bg-gradient-to-r from-blue-500 to-purple-600',
        members: [
            { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin' },
            { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'member' },
            { id: '3', name: 'Mike Johnson', email: 'mike@example.com', role: 'member' },
            { id: '4', name: 'Sarah Wilson', email: 'sarah@example.com', role: 'member' }
        ],
        lists: [
            {
                id: '1',
                title: 'To Do',
                position: 0,
                cards: [
                    {
                        id: '1',
                        title: 'Setup project structure',
                        description: 'Create the basic project structure and configuration',
                        labels: [{ id: '1', name: 'Setup', color: 'bg-blue-500' }],
                        position: 0,
                        priority: 'high',
                        reporterId: '1',
                        comments: [],
                        activities: []
                    }
                ]
            },
            {
                id: '2',
                title: 'In Progress',
                position: 1,
                cards: []
            },
            {
                id: '3',
                title: 'Review',
                position: 2,
                cards: []
            },
            {
                id: '4',
                title: 'Done',
                position: 3,
                cards: []
            }
        ]
    });

    const [boards] = useState<Board[]>([currentBoard]);
    const [selectedBoard, setSelectedBoard] = useState<Board | null>(currentBoard);

    const updateBoard = (updatedBoard: Board) => {
        setCurrentBoard(updatedBoard);
        if (selectedBoard?.id === updatedBoard.id) {
            setSelectedBoard(updatedBoard);
        }
    };

    const handleSelectBoard = (board: Board | null) => {
        setSelectedBoard(board);
        if (board) {
            setCurrentBoard(board);
        }
    };

    const updateBoards = (updatedBoards: Board[]) => {
        const updatedCurrentBoard = updatedBoards.find(board => board.id === currentBoard.id);
        if (updatedCurrentBoard) {
            setCurrentBoard(updatedCurrentBoard);
            if (selectedBoard?.id === updatedCurrentBoard.id) {
                setSelectedBoard(updatedCurrentBoard);
            }
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <div className='w-full'>
                <Outlet />
            </div>
            {/* {selectedBoard ? (
                <BoardView board={selectedBoard} onUpdateBoard={updateBoard} />
            ) : (
                <AllBoardsView boards={boards} onSelectBoard={handleSelectBoard} />
            )} */}
        </div>
    );
};

export default Layout;