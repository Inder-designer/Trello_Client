import { useEffect, useState } from 'react';
import { Archive, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CardComponent from '@/components/Project/CardComponent';
import AddCard from '../Modals/AddCard';
import { useMoveCardMutation } from '@/redux/api/Card';
import { IList } from '@/Types/IList';
import { IBoard } from '@/Types/IBoard';
import { useDeleteListMutation, useUpdateListMutation } from '@/redux/api/List';
import { showConfirmDialog, showLoadingDialog } from '../Dialog/Comman';
import Swal from "sweetalert2";
import { toast } from 'sonner';
import { boardApi } from '@/redux/api/Board';
import type { AppDispatch } from "@/redux/store/store";
import { useDispatch } from 'react-redux';

interface ListComponentProps {
    list: IList;
    board: IBoard;
    isOwner?: boolean;
    isClosed?: boolean;
    autoOpenCardId?: string | null;
    setAutoOpenCardId?: (cardId: string | null) => void;
    setSearchParams?: (params: URLSearchParams | ((prev: URLSearchParams) => URLSearchParams)) => void;
}

const ListComponent = ({ list, board, isOwner, isClosed, autoOpenCardId, setAutoOpenCardId, setSearchParams }: ListComponentProps) => {
    const dispatch = useDispatch<AppDispatch>()
    const [moveCardToList] = useMoveCardMutation()
    const [updateList, { isLoading }] = useUpdateListMutation()

    const [deleteList] = useDeleteListMutation()

    const [isCreateCardOpen, setIsCreateCardOpen] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [listTitle, setListTitle] = useState(list.title);

    const updateListTitle = async () => {
        setIsEditingTitle(false);
        if (listTitle.trim() && listTitle !== list.title) {
            const data = { title: listTitle }
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
        const toListId = list._id;

        if (!toListId || fromListId === toListId) return;

        const optimisticUpdate = dispatch(
            boardApi.util.updateQueryData('getBoard', board._id, (draft: IBoard) => {
                const fromList = draft.lists.find((l) => l._id === fromListId);
                const toList = draft.lists.find((l) => l._id === toListId);
                if (!fromList || !toList) return;

                const cardIndex = fromList.cards.findIndex((c) => c._id === cardId);
                if (cardIndex === -1) return;
                const [card] = fromList.cards.splice(cardIndex, 1);
                card.listId = toListId;
                toList.cards.push(card);
            })
        );

        const data = { listId: toListId };

        try {
            await moveCardToList({ data, cardId }).unwrap();
        } catch (error) {
            // Revert the optimistic update on error
            optimisticUpdate.undo();
            toast.error("Failed to move card");
        }
    };


    return (
        <div className="flex-shrink-0 w-72">
            <Card className="bg-gray-100 border shadow-sm">
                <CardHeader className="py-2 px-3">
                    <div className="flex items-center justify-between">
                        {isEditingTitle && !isClosed ? (
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
                                className={`text-sm font-semibold text-gray-800 flex items-center gap-1 ${isOwner && !isClosed ? 'cursor-pointer hover:bg-gray-200 px-2 py-1 rounded' : ''
                                    }`}
                                onClick={() => isOwner && !isClosed && setIsEditingTitle(true)}
                            >

                                {list.title}{isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                            </h3>
                        )}

                        {!isClosed &&
                            <div className="flex items-center gap-1">
                                <Badge variant="secondary" className="text-xs">
                                    {list?.cards?.length || 0}
                                </Badge>
                                {isOwner && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={handleDeleteList}
                                    >
                                        <Archive className="h-3 w-3" />
                                    </Button>
                                )}
                            </div>
                        }
                    </div>
                </CardHeader>

                <CardContent
                    className={`space-y-2 ${isOwner ? "max-h-[calc(100vh-288px)]" : "max-h-[calc(100vh-242px)]"} overflow-y-auto py-3 px-3 border-y`}
                    onDragOver={isClosed ? undefined : handleDragOver}
                    onDrop={isClosed ? undefined : handleDrop}
                >
                    {list?.cards?.map((card, index) => (
                        <CardComponent
                            key={index}
                            card={card}
                            listId={list._id}
                            board={board}
                            isOwner={isOwner}
                            isClosed={isClosed}
                            autoOpenCardId={autoOpenCardId}
                            setAutoOpenCardId={setAutoOpenCardId}
                            setSearchParams={setSearchParams}
                        />
                    ))}

                </CardContent>

                {isOwner && !isClosed && (
                    <AddCard isCreateCardOpen={isCreateCardOpen} setIsCreateCardOpen={setIsCreateCardOpen} list={list} board={board} />
                )}
            </Card>
        </div>
    );
};

export default ListComponent;