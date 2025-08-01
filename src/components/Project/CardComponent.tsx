import { useState, useEffect } from 'react';
import { Trash, Calendar, Flag, MessageSquare, Activity, } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Swal from "sweetalert2";
import EditCard from '../Modals/AddCard';
import { ICard } from '@/Types/ICard';
import { IBoard } from '@/Types/IBoard';
import { useDeleteCardMutation } from '@/redux/api/Card';
import { toast } from 'sonner';
import { showConfirmDialog, showLoadingDialog } from '../Dialog/Comman';
import CardDetails from '../Modals/CardDetails';

interface CardComponentProps {
    card: ICard;
    listId: string;
    board: IBoard;
    isOwner?: boolean;
    isClosed?: boolean;
    autoOpenCardId?: string | null;
    setAutoOpenCardId?: (cardId: string | null) => void;
    setSearchParams?: (params: URLSearchParams | ((prev: URLSearchParams) => URLSearchParams)) => void;
}

const CardComponent = ({ card, board, isOwner, isClosed, autoOpenCardId, setAutoOpenCardId, setSearchParams }: CardComponentProps) => {
    const [deleteCard] = useDeleteCardMutation()
    const [isCreateCardOpen, setIsCreateCardOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const priorityColors = {
        low: 'bg-green-500',
        medium: 'bg-yellow-500',
        high: 'bg-orange-500',
        urgent: 'bg-red-500'
    };

    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('cardId', card?._id);
        e.dataTransfer.setData('fromListId', card?.listId);
    };

    const getPriorityIcon = () => {
        return <Flag className={`h-3 w-3 ${priorityColors[card?.priority]}`} />;
    };

    const isOverdue = card?.dueDate && new Date() > new Date(card.dueDate);

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering the card's onClick
        const confirmed = await showConfirmDialog(
            "Are you sure you want to delete this card?",
            "",
            {
                confirmButtonText: "Delete",
                cancelButtonText: "Cancel",
                icon: "warning"
            }
        );
        if (!confirmed) return;
        showLoadingDialog("Deleting...");
        await deleteCard({ cardId: card?._id }).unwrap().then(() => {
            Swal.close();
            toast.success("Card deleted successfully")
        }).catch((err) => {
            Swal.close();
            toast.error(err?.data?.message || "Failed to delete card")
        });
    }

    // Handle auto-opening card details from URL query parameter
    useEffect(() => {
        if ((autoOpenCardId === card.shortLink || autoOpenCardId === card._id) && setAutoOpenCardId) {
            setIsDetailsOpen(true);
            setAutoOpenCardId(null); // Clear the auto-open state after opening
        }
    }, [autoOpenCardId, card._id, setAutoOpenCardId]);

    const handleCardClick = () => {
        setIsDetailsOpen(true);
        // Set URL query parameter when opening card details
        if (setSearchParams) {
            setSearchParams(prev => {
                const newParams = new URLSearchParams(prev);
                newParams.set('c', card.shortLink || card._id);
                return newParams;
            });
        }
    };

    const handleDetailsClose = () => {
        setIsDetailsOpen(false);
        // Remove URL query parameter when closing card details
        if (setSearchParams) {
            setSearchParams(prev => {
                const newParams = new URLSearchParams(prev);
                newParams.delete('c');
                return newParams;
            });
        }
    };

    return (
        <>
            <Card
                className={`bg-white hover:shadow-md transition-shadow cursor-pointer group relative`}
                draggable={!isClosed}
                // isClosed then not draggable
                onDragStart={isClosed ? undefined : handleDragStart}
                onClick={handleCardClick}
            >
                {card?.attachments?.length > 0 && card.attachments[0]?.url && card.attachments[0]?.type !== "pdf" && (
                    <CardHeader className="p-0">
                        <div className='h-32 w-full relative bg-slate-200 overflow-hidden rounded-lg'>
                            <img src={card?.attachments[0]?.url} alt="" className='w-full h-full object-contain' />
                        </div>
                    </CardHeader>
                )}
                <CardHeader className="py-2 px-3">
                    <div className="flex items-start justify-between">
                        <CardTitle className="text-sm font-medium leading-tight">
                            {card?.title}
                        </CardTitle>
                        {isOwner && !isClosed && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 absolute top-1 right-1 z-20" onClick={(e) => e.stopPropagation()}>
                                <EditCard isCreateCardOpen={isCreateCardOpen} setIsCreateCardOpen={setIsCreateCardOpen} board={board} card={card} />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 bg-white/40 hover:bg-red-100 hover:text-red-600"
                                    onClick={handleDelete}
                                >
                                    <Trash className="h-3 w-3" />
                                </Button>
                            </div>
                        )}
                    </div>

                    {card?.description && (
                        <CardDescription className="text-xs line-clamp-2">
                            {card?.description}
                        </CardDescription>
                    )}
                </CardHeader>

                <CardContent className="pt-0 px-3">
                    <div className="space-y-2">
                        {/* Priority and Labels */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                                {getPriorityIcon()}
                                <span className="text-xs capitalize">{card?.priority}</span>
                            </div>

                            {/* {card.labels.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {card.labels.slice(0, 2).map((label) => (
                    <Badge 
                      key={label.id} 
                      className={`${label.color} text-white text-xs px-1 py-0`}
                    >
                      {label.name}
                    </Badge>
                  ))}
                  {card.labels.length > 2 && (
                    <Badge variant="secondary" className="text-xs px-1 py-0">
                      +{card.labels.length - 2}
                    </Badge>
                  )}
                </div>
              )} */}
                        </div>

                        {/* Dates */}
                        {(card?.dueDate) && (
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                {card?.dueDate && (
                                    <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-500' : ''}`}>
                                        <Calendar className="h-3 w-3" />
                                        {format(card?.dueDate, 'MMM dd, yyyy')}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Bottom Row - Assignees, Comments, Activities */}
                        <div className="flex items-center justify-between">
                            {card?.idMembers && card?.idMembers.length > 0 && (
                                <div className="flex -space-x-1">
                                    {card?.idMembers.slice(0, 3).map((member, index) => (
                                        <div
                                            key={index}
                                            className="w-8 h-8 bg-red-400 text-white text-sm font-medium rounded-full flex items-center justify-center"
                                            title={member?.fullName}
                                        >
                                            {member?.initials}
                                            {/* <User className="h-4 w-4 text-white" /> */}
                                        </div>
                                    ))}
                                    {card?.idMembers.length > 4 && (
                                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center border-2 border-white">
                                            <span className="text-xs text-white font-medium">+{card?.idMembers.length - 4}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center gap-2">
                                {/* {card?.comments?.length > 0 && ( */}
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <MessageSquare className="h-3 w-3" />
                                    {card?.commentCounts || 0}
                                </div>
                                {/* )} */}
                                {/* {card?.activities?.length > 0 && ( */}
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Activity className="h-3 w-3" />
                                    {card?.activities?.length || 1}
                                </div>
                                {/* )} */}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {isDetailsOpen && (
                <CardDetails
                    cardId={card?._id}
                    isDialogOpen={isDetailsOpen}
                    setIsDialogOpen={handleDetailsClose}
                    isClosed={isClosed}
                    setSearchParams={setSearchParams}
                />
            )}
        </>
    );
};

export default CardComponent;