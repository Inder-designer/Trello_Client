import { useState, useEffect, useMemo, useCallback } from 'react';
import { Info, Key, Loader2 } from 'lucide-react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { SetURLSearchParams } from 'react-router-dom';

import BoardFilters from '@/components/Project/BoardFilters';
import AddList from '@/components/Modals/AddList';
import ListComponent from '@/components/Project/ListComponent';
import {
    useGetBoardQuery,
    useRequestStatusQuery,
} from '@/redux/api/Board';
import { IUser } from '@/Types/IUser';
import { ICard } from '@/Types/ICard';
import MalformedURL from '@/components/Project/MalformedURL';
import AccessDeniedComponent from '@/components/Project/AccessDeniedComponent';
import Notification from '@/components/Notification/Notification';

const INITIAL_FILTER_STATE = {
    member: '',
    label: '',
    priority: '',
    status: '',
    dueDate: '',
    assignedToMe: false,
    search: '',
};

const Project = () => {
    const { id } = useParams<{ id: string }>();
    const [searchParams, setSearchParams] = useSearchParams();
    const user = useSelector((state: { auth: { user: IUser | null } }) => state.auth.user);

    const [filters, setFilters] = useState(INITIAL_FILTER_STATE);
    const [isCreateListOpen, setIsCreateListOpen] = useState(false);
    const [shouldCheckStatus, setShouldCheckStatus] = useState(false);
    const [autoOpenCardId, setAutoOpenCardId] = useState<string | null>(null);
    const currentUserId = user?._id;

    const { data, isLoading, error, isFetching } = useGetBoardQuery(id!, { skip: !id });
    const isOwner = useMemo(() => data?.owner === user?._id, [data?.owner, user?._id]);
    const isClosed = useMemo(() => data?.isClosed, [data?.isClosed]);
    const { data: statusData, isLoading: statusLoading, error: statusError } = useRequestStatusQuery(id!, {
        skip: !shouldCheckStatus || !id,
    });

    useEffect(() => {
        if (
            error &&
            (error as any).status === 403 &&
            (error as any).data?.message === 'You are not a member of this board'
        ) {
            setShouldCheckStatus(true);
        }
    }, [error]);

    const handleFilterChange = useCallback(
        (filterType: keyof typeof INITIAL_FILTER_STATE, value: string | boolean) => {
            setFilters(prev => ({ ...prev, [filterType]: value }));
        },
        []
    );

    const clearAllFilters = useCallback(() => setFilters(INITIAL_FILTER_STATE), []);

    useEffect(() => {
        // if x key is pressed, clear filters
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'x' || e.key === 'X') {
                clearAllFilters();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [clearAllFilters]);

    const isDueDateMatch = useCallback((cardDueDate: string | undefined, filterDueDate: string) => {
        if (!filterDueDate) return true;
        if (filterDueDate === 'no-due-date') return !cardDueDate;
        if (!cardDueDate) return false;

        const now = new Date();
        const dueDate = new Date(cardDueDate);
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const cardDue = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

        switch (filterDueDate) {
            case 'overdue':
                return cardDue < today;
            case 'today':
                return cardDue.getTime() === today.getTime();
            case 'this-week': {
                const weekEnd = new Date(today);
                weekEnd.setDate(today.getDate() + (6 - today.getDay()));
                return cardDue >= today && cardDue <= weekEnd;
            }
            case 'next-week': {
                const nextStart = new Date(today);
                nextStart.setDate(today.getDate() + (7 - today.getDay()));
                const nextEnd = new Date(nextStart);
                nextEnd.setDate(nextStart.getDate() + 6);
                return cardDue >= nextStart && cardDue <= nextEnd;
            }
            default:
                return true;
        }
    }, []);

    const isCardMatch = useCallback(
        (card: ICard, listId: string) => {
            const { member, label, priority, status, dueDate, assignedToMe, search } = filters;
            return (
                (!member || card.idMembers?.some(m => m._id === member)) &&
                (!label || card.labels?.some(l => l.id === label)) &&
                (!priority || card.priority === priority) &&
                (!status || listId === status) &&
                (!assignedToMe || card.idMembers?.some(m => m._id === currentUserId)) &&
                isDueDateMatch(card.dueDate, dueDate) &&
                (!search ||
                    card.title.toLowerCase().includes(search.toLowerCase()) ||
                    card.description?.toLowerCase().includes(search.toLowerCase()))
            );
        },
        [filters, currentUserId, isDueDateMatch]
    );

    const filteredLists = useMemo(() => {
        return data?.lists?.map(list => ({
            ...list,
            cards: list.cards?.filter(card => isCardMatch(card, list._id)) || []
        })) || [];
    }, [data?.lists, isCardMatch]);

    const isAccessDenied = error &&
        (error as any).status === 403 &&
        (error as any).data?.message === 'You are not a member of this board';

    const LoadingSpinner = () => (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading...</span>
        </div>
    );

    // Handle URL query parameter for auto-opening card details
    useEffect(() => {
        const cardId = searchParams.get('c');
        if (cardId && data) {
            setAutoOpenCardId(cardId);
        }
    }, [searchParams, data]);

    if (isLoading || statusLoading || isFetching) return <LoadingSpinner />;
    if ((error as any)?.status === 404 || (error as any)?.status === 400) return <MalformedURL status={(error as any)?.status} />;
    if ((statusError as any)?.status === 404) return (
        <div className="flex justify-center min-h-screen pt-16 px-4">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Board not found</h1>
                <p className="text-gray-600 max-w-2xl mx-auto">The board you're looking for may have been deleted or the URL might have a typo. Check that you have the correct link or contact the board admin for help.</p>
            </div>
        </div>
    );
    if (isAccessDenied) return <AccessDeniedComponent statusData={statusData} />;
    if (data?.isLeave) {
        return (
            <div className="flex justify-center min-h-screen pt-16 px-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">You have left this board</h1>
                    <p className="text-gray-600">You can no longer access this board.</p>
                    <p className="text-gray-600">If you want to rejoin, please contact the board owner.</p>
                </div>
            </div>
        );
    }
    if (isClosed && !isOwner) {
        return (
            <div className="flex justify-center min-h-screen pt-16 px-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">{data?.title} is closed</h1>
                    <p className="text-gray-600">You can no longer access this board.</p>
                    <p className="text-gray-600">To reopen this board, contact this board admin:</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col">
            <div className={`${data?.background} px-6 py-4`}>
                <div className='flex items-center justify-between'>
                    <h1 className="text-2xl font-bold text-white">{data?.title}</h1>
                    <Notification />
                </div>
                {/* {data?.description && <p className="text-white/80 mt-1">{data.description}</p>} */}
            </div>

            <BoardFilters
                board={data}
                {...filters}
                currentUserId={currentUserId}
                onSearchChange={value => handleFilterChange('search', value)}
                onMemberFilterChange={value => handleFilterChange('member', value)}
                onLabelFilterChange={value => handleFilterChange('label', value)}
                onPriorityFilterChange={value => handleFilterChange('priority', value)}
                onStatusFilterChange={value => handleFilterChange('status', value)}
                onDueDateFilterChange={value => handleFilterChange('dueDate', value)}
                onAssignedToMeToggle={value => handleFilterChange('assignedToMe', value)}
                onClearFilters={clearAllFilters}
                isOwner={isOwner}
            />

            <div className="flex-1 overflow-x-auto bg-gray-50 w-[calc(100vw-256px)]">
                <div className="flex gap-4 p-6 h-full min-w-max">
                    {filteredLists.map(list => (
                        <ListComponent 
                            key={list._id} 
                            list={list} 
                            board={data} 
                            isOwner={isOwner} 
                            isClosed={isClosed}
                            autoOpenCardId={autoOpenCardId}
                            setAutoOpenCardId={setAutoOpenCardId}
                            setSearchParams={setSearchParams}
                        />
                    ))}

                    {isOwner && !isClosed && (
                        <div className="flex-shrink-0">
                            <AddList
                                isCreateListOpen={isCreateListOpen}
                                setIsCreateListOpen={setIsCreateListOpen}
                                boardId={data?._id}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Project;
