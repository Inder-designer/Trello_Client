import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDeleteBoardMutation } from '@/redux/api/Board'
import { IBoard } from '@/Types/IBoard'
import { Delete, List, Trash, Users } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import AddBoard from './AddBoard'
import { Link } from 'react-router-dom'

const BoardCard = ({ board, isOwned }: { board: IBoard, isOwned?: boolean }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [deleteBoard] = useDeleteBoardMutation()

    const handleDeleteBoard = async (id: string) => {
        await deleteBoard(id)
            .unwrap()
            .then(() => {
                toast.success("Board Delete Successfully")
            })
            .catch((err) => {
                toast.error(err?.data?.message || "Failed to delete board")
            });
    }

    return (
        <>
            <Card
                key={board._id}
                className="hover:shadow-lg transition-shadow"
            >
                <CardHeader className="p-3">
                    <div className='flex items-center justify-between'>
                        <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded ${board.background || "bg-gray-300"}`} />
                            <CardTitle className="text-lg"><Link to={`/board/${board._id}`}>{board.title}</Link></CardTitle>
                        </div>
                        {isOwned &&
                            <div className='flex gap-2'>
                                <AddBoard isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} board={board} />
                                <button className='' onClick={() => handleDeleteBoard(board._id)}><Trash size="16" className='text-red-600' /></button>
                            </div>
                        }
                    </div>
                    {board.description && (
                        <p className="text-sm text-gray-600 mt-2">{board.description}</p>
                    )}
                </CardHeader>
                <CardContent className='pb-3 pt-2 px-3'>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                                <List className="h-4 w-4" />
                                {board.lists.length} lists
                            </span>
                            <span className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {board.members.length} members
                            </span>
                        </div>
                        <Badge >
                            {board.cardCounts || 0} cards
                        </Badge>
                    </div>
                </CardContent>
            </Card>
        </>
    )
}

export default BoardCard