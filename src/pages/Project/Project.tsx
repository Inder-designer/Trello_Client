import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BoardFilters from '@/components/BoardFilters';
import { useGetBoardQuery, useRequestJoinMutation, useRequestStatusQuery } from '@/redux/api/Board';
import { useParams } from 'react-router-dom';
import AddList from '../../components/Project/AddList';
import ListComponent from '../../components/Project/ListComponent';
import { useDispatch, useSelector } from 'react-redux';
import { setBoardData } from '@/redux/Slices/boardSlice';
import { socket } from '@/utils/socket';
import { useBoardSocket } from '@/hooks/useBoardSocket';

const Project = () => {
    const { id } = useParams();
    const user = useSelector((state: any) => state.auth.user);
    const [shouldCheckStatus, setShouldCheckStatus] = useState(false);
    const { data, isLoading, error } = useGetBoardQuery(id, { skip: !id });
    const [requestJoin, { isLoading: joinLoading }] = useRequestJoinMutation();
    const dispatch = useDispatch();
    const { boardData, lists } = useSelector((state: any) => state.board);
    const [isCreateListOpen, setIsCreateListOpen] = useState(false);
    const [filterByMember, setFilterByMember] = useState('');
    const [filterByLabel, setFilterByLabel] = useState('');
    const [filterByPriority, setFilterByPriority] = useState('');
    const [filterByStatus, setFilterByStatus] = useState('');
    const [filterByDueDate, setFilterByDueDate] = useState('');
    const [filterAssignedToMe, setFilterAssignedToMe] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [requestSent, setRequestSent] = useState(false);
    const currentUserId = '1';

    useEffect(() => {
        if (boardData?._id && user?._id) {
            const payload = {
                boardId: boardData._id,
                userId: user._id,
                isOwner: boardData?.owner === user._id,
            };

            socket.emit("joinBoardRoom", payload);
            console.log("Joined board room:", payload);

            return () => {
                socket.emit("leaveBoardRoom", payload);
                console.log("Left board room:", payload);
            };
        }
    }, [boardData?._id, user?._id]);


    useEffect(() => {
        if (error && (error as any).status === 403 && (error as any).data?.message === 'You are not a member of this board') {
            setShouldCheckStatus(true);
        }
    }, [error]);

    const { data: statusData, isLoading: statusLoading } = useRequestStatusQuery(id, {
        skip: !shouldCheckStatus || !id,
    });

    useEffect(() => {
        if (data) {
            dispatch(setBoardData(data));
        }
    }, [data, dispatch]);
    
    useBoardSocket(boardData?._id);

    const clearAllFilters = () => {
        setSearchQuery('');
        setFilterByMember('');
        setFilterByLabel('');
        setFilterByPriority('');
        setFilterByStatus('');
        setFilterByDueDate('');
        setFilterAssignedToMe(false);
    };

    // Memoize filtered lists for performance
    const filteredLists = useMemo(() => {
        if (!boardData?.lists) return [];
        return boardData?.lists.map(list => ({
            ...list,
            cards: list.cards.filter(card => {
                const matchesMember = !filterByMember || card.assignedTo?.includes(filterByMember);
                const matchesLabel = !filterByLabel || card.labels.some(label => label.id === filterByLabel);
                const matchesPriority = !filterByPriority || card.priority === filterByPriority;
                const matchesStatus = !filterByStatus || list.id === filterByStatus;
                const matchesAssignedToMe = !filterAssignedToMe || card.assignedTo?.includes(currentUserId);
                // Due date filtering
                let matchesDueDate = true;
                if (filterByDueDate && card.dueDate) {
                    const now = new Date();
                    const dueDate = new Date(card.dueDate);
                    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    const cardDueDate = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
                    switch (filterByDueDate) {
                        case 'overdue': {
                            matchesDueDate = cardDueDate < today;
                            break;
                        }
                        case 'today': {
                            matchesDueDate = cardDueDate.getTime() === today.getTime();
                            break;
                        }
                        case 'this-week': {
                            const thisWeekEnd = new Date(today);
                            thisWeekEnd.setDate(today.getDate() + (6 - today.getDay()));
                            matchesDueDate = cardDueDate >= today && cardDueDate <= thisWeekEnd;
                            break;
                        }
                        case 'next-week': {
                            const nextWeekStart = new Date(today);
                            nextWeekStart.setDate(today.getDate() + (7 - today.getDay()));
                            const nextWeekEnd = new Date(nextWeekStart);
                            nextWeekEnd.setDate(nextWeekStart.getDate() + 6);
                            matchesDueDate = cardDueDate >= nextWeekStart && cardDueDate <= nextWeekEnd;
                            break;
                        }
                        case 'no-due-date': {
                            matchesDueDate = !card.dueDate;
                            break;
                        }
                    }
                } else if (filterByDueDate === 'no-due-date') {
                    matchesDueDate = !card.dueDate;
                }
                const matchesSearch = !searchQuery ||
                    card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    card.description?.toLowerCase().includes(searchQuery.toLowerCase());
                return matchesMember && matchesLabel && matchesPriority && matchesStatus &&
                    matchesDueDate && matchesSearch && matchesAssignedToMe;
            })
        }));
    }, [boardData, filterByMember, filterByLabel, filterByPriority, filterByStatus, filterByDueDate, filterAssignedToMe, searchQuery, currentUserId]);

    if (isLoading || statusLoading) {
        return <div>Loading...</div>;
    }

    if (error && (error as any).status === 403 && (error as any).data?.message === 'You are not a member of this board') {
        return (
            <div className='pt-10'>
                {statusData?.status === "allowed" ?
                    !requestSent ? (
                        <div className='max-w-[500px] mx-auto text-center border border-border bg-gray-200 p-6 rounded-lg shadow-md'>
                            <img src="https://trello.com/assets/3c7105ff523d79abba48.svg" alt="" className='w-40 mx-auto mb-6' />
                            <h2 className='text-2xl font-bold mb-4 text-gray-700'>This board is private</h2>
                            <p className='text-gray-600 mb-8'>Send a request to this board’s admins to get access. If you’re approved to join, you'll receive an email.</p>
                            <p className='mb-3 text-xs text-left text-gray-600'>By requesting access, you agree to share your Atlassian account information, including your email address, with the board admins.</p>
                            <button
                                onClick={async () => {
                                    try {
                                        await requestJoin({ boardId: id }).unwrap();
                                        setRequestSent(true);
                                    } catch (error) {
                                        console.error('Failed to send request:', error);
                                        alert('Failed to send request. Please try again later.');
                                    }
                                }}
                                className='bg-blue-600 text-white hover:bg-blue-700 w-full py-1.5'
                                disabled={joinLoading}
                            >
                                {joinLoading ? "Sending request..." : "Send Request"}
                            </button>
                        </div>
                    ) : (
                        <div className='max-w-[500px] mx-auto text-center border border-border bg-gray-200 p-6 rounded-lg shadow-md'>
                            <img src="https://trello.com/assets/3c7105ff523d79abba48.svg" alt="" className='w-40 mx-auto mb-6' />
                            <h2 className='text-2xl font-bold mb-4 text-gray-700'>Request sent</h2>
                            <p className='text-gray-600 flex items-center justify-center gap-2'><CheckCircle className='text-green-500 w-5' /> You’ll get an email if you’re approved to join.</p>
                        </div>
                    ) : (
                        <div className='max-w-[500px] mx-auto text-center border border-border bg-gray-200 p-6 rounded-lg shadow-md'>
                            <img src="https://trello.com/assets/3c7105ff523d79abba48.svg" alt="" className='w-40 mx-auto mb-6' />
                            <h2 className='text-2xl font-bold mb-4 text-gray-700'>Request sent</h2>
                            <p className='text-gray-600 flex items-center justify-center gap-2'><CheckCircle className='text-green-500 w-5' /> You’ll get an email if you’re approved to join.</p>
                        </div>
                    )}
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col">
            {/* Board Header */}
            <div className={`${data?.background} px-6 py-4`}>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">{data?.title}</h1>
                        {data?.description && (
                            <p className="text-white/80 mt-1">{data?.description}</p>
                        )}
                    </div>
                </div>
            </div>
            <BoardFilters
                data={boardData}
                board={boardData}
                searchQuery={searchQuery}
                filterByMember={filterByMember}
                filterByLabel={filterByLabel}
                filterByPriority={filterByPriority}
                filterByStatus={filterByStatus}
                filterByDueDate={filterByDueDate}
                filterAssignedToMe={filterAssignedToMe}
                currentUserId={currentUserId}
                onSearchChange={setSearchQuery}
                onMemberFilterChange={setFilterByMember}
                onLabelFilterChange={setFilterByLabel}
                onPriorityFilterChange={setFilterByPriority}
                onStatusFilterChange={setFilterByStatus}
                onDueDateFilterChange={setFilterByDueDate}
                onAssignedToMeToggle={setFilterAssignedToMe}
                onClearFilters={clearAllFilters}
            />
            {/* Lists Container */}
            <div className="flex-1 overflow-x-auto bg-gray-50 w-[calc(100vw-256px)]">
                <div className="flex gap-4 p-6 h-full min-w-max">
                    {filteredLists.map((list, index) => (
                        <ListComponent
                            key={index}
                            list={list}
                            board={boardData}
                        />
                    ))}
                    {/* Add List Button */}
                    <div className="flex-shrink-0">
                        <AddList isCreateListOpen={isCreateListOpen} setIsCreateListOpen={setIsCreateListOpen} boardId={boardData?._id} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Project;