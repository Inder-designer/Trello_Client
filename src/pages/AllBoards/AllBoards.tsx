import { Board } from '@/pages/Index';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, List, Crown, UserCheck } from 'lucide-react';
import { useGetAllBoardsQuery } from '@/redux/api/Board';
import { IBoard } from '@/Types/IBoard';
import BoardCard from './Components/BoardCard';
import AddBoard from './Components/AddBoard';
import { useState } from 'react';

interface AllBoardsProps {
    boards?: Board[];
    onSelectBoard?: (board: Board) => void;
}

const AllBoards = ({ boards, onSelectBoard }: AllBoardsProps) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { data } = useGetAllBoardsQuery({})
    return (
        <div className="flex-1 p-6 bg-gray-50">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">All Boards</h1>
                    <p className="text-gray-600">Manage and view all your project boards</p>
                </div>
                <div>
                    <AddBoard isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
                </div>
            </div>

            <div>
                <div className="flex items-center gap-2 mb-4">
                    <Crown className="h-5 w-5 text-yellow-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Own Boards</h2>
                    <span className='text-sm bg-gray-200 w-6 h-6 flex items-center justify-center rounded-full font-medium'>{data?.ownedBoards?.length}</span>
                </div>
                {data?.ownedBoards?.length ?
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {data?.ownedBoards?.map((board: IBoard) => (
                            <BoardCard board={board} isOwned={true} />
                        ))}
                    </div>
                    :
                    <div className="text-center py-8 text-gray-500">
                        <Crown className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>No boards created yet. Create your first board to get started!</p>
                    </div>
                }
            </div>

            <div className='mt-8'>
                <div className="flex items-center gap-2 mb-4">
                    <UserCheck className="h-5 w-5 text-yellow-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Guest Boards</h2>
                    <span className='text-sm bg-gray-200 w-6 h-6 flex items-center justify-center rounded-full font-medium'>{data?.ownedBoards?.length}</span>
                </div>
                <div className='w-full'>
                    {data?.memberBoards?.length ?
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {data?.memberBoards?.map((board: IBoard) => (
                                <BoardCard board={board} />
                            ))}
                        </div>
                        :
                        <div className="text-center py-8 text-gray-500">
                            <UserCheck className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <p>You haven't been invited to any boards yet.</p>
                        </div>
                    }
                </div>
            </div>
        </div>
    );
};

export default AllBoards;