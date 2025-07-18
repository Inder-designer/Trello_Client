import { useEffect, useState } from 'react';
import { Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { List, Board, } from '@/pages/Index';
import CardComponent from '@/components/Project/CardComponent';
import AddCard from './AddCard';
import { useGetCardsQuery, useMoveCardMutation } from '@/redux/api/card';
import { IList } from '@/Types/IList';
import { IBoard } from '@/Types/IBoard';
import { useDispatch } from 'react-redux';
import { moveCard, removeList } from '@/redux/Slices/boardSlice';
import { useDeleteListMutation, useUpdateListMutation } from '@/redux/api/List';
import { showConfirmDialog, showLoadingDialog } from '../Dialog/Comman';
import Swal from "sweetalert2";
import { toast } from 'sonner';

interface ListComponentProps {
    list: IList;
    board: IBoard;
}

const ListComponent = ({ list, board }: ListComponentProps) => {
    const dispatch = useDispatch()
    const [moveCardToList] = useMoveCardMutation()
    const [updateList, { isLoading }] = useUpdateListMutation()

    const [deleteList] = useDeleteListMutation()

    const [isCreateCardOpen, setIsCreateCardOpen] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [listTitle, setListTitle] = useState(list.title);

    const updateListTitle = async () => {
        if (listTitle.trim() && listTitle !== list.title) {
            const data = { title: listTitle }
            setIsEditingTitle(false);
            await updateList({ data, listId: list?._id }).unwrap().catch((err) => {
                setListTitle(list.title);
                toast.error(err?.data?.message || "Failed to update list title")
            })
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDeleteList = async () => {
        const listId = list._id
        const confirmed = await showConfirmDialog(
            "Are you sure you want to delete this list?",
            "All cards under this list will be deleted automatically.",
            {
                confirmButtonText: "Delete",
                cancelButtonText: "Cancel",
                icon: "warning"
            }
        );
        if (!confirmed) return;
        showLoadingDialog("Deleting...");
        await deleteList(listId).unwrap().then(() => {
            Swal.close();
            toast.success("List deleted successfully")
        })
    }

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        const cardId = e.dataTransfer.getData('cardId');
        const fromListId = e.dataTransfer.getData('fromListId');
        const toListId = list?._id;

        if (!toListId || fromListId === toListId) return;

        const payload = { cardId, fromListId, toListId };

        dispatch(moveCard(payload));
        const data = { listId: toListId };
        await moveCardToList({ data, cardId }).unwrap().catch((err) => {
            dispatch(moveCard({ cardId, fromListId: toListId, toListId: fromListId }));
        });
    };

    return (
        <div className="flex-shrink-0 w-72">
            <Card className="bg-gray-100 border shadow-sm">
                <CardHeader className="py-2">
                    <div className="flex items-center justify-between">
                        {isEditingTitle ? (
                            <Input
                                value={listTitle}
                                onChange={(e) => setListTitle(e.target.value)}
                                onBlur={updateListTitle}
                                onKeyPress={(e) => e.key === 'Enter' && updateListTitle()}
                                className="text-sm font-semibold"
                                autoFocus
                            />
                        ) : (
                            <h3
                                className="text-sm font-semibold text-gray-800 cursor-pointer hover:bg-gray-200 px-2 py-1 rounded"
                                onClick={() => setIsEditingTitle(true)}
                            >
                                {list.title}
                            </h3>
                        )}

                        <div className="flex items-center gap-1">
                            <Badge variant="secondary" className="text-xs">
                                {list.cards.length || 0}
                            </Badge>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={handleDeleteList}
                            >
                                <Archive className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent
                    className="space-y-2 max-h-[calc(100vh-260px)] overflow-y-auto py-3 px-3 border-y"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    {list?.cards.map((card, index) => (
                        <CardComponent
                            key={index}
                            card={card}
                            listId={list._id}
                            board={board}
                        />
                    ))}

                </CardContent>

                <AddCard isCreateCardOpen={isCreateCardOpen} setIsCreateCardOpen={setIsCreateCardOpen} list={list} board={board} />
            </Card>
        </div>
    );
};

export default ListComponent;