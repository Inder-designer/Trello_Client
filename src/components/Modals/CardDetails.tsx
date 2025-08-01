import { useAddCommentMutation, useDeleteCommentMutation, useGetCardQuery, useReactCommentMutation } from '@/redux/api/Card';
import { ICard } from '@/Types/ICard';
import { format, formatDistanceToNow, set } from 'date-fns';
import { Modal, ModalBody, Button } from 'flowbite-react'
import { Activity, Flag, MessageSquare, SmilePlus, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react'
import EmojiPicker from 'emoji-picker-react';
import { formatReactedUsersTooltip } from '@/utils/Common';
import { useSelector } from 'react-redux';
import Loader from '../Loaders/Loader';
import ConfirmPopup from '../Popup/ConfirmPopup';
import { IUser } from '@/Types/IUser';
import CardDetailsSkeleton from '../Skeleton/CardDetailsSkeleton';
import { Link, useLocation } from 'react-router-dom';

interface CardDetailsProps {
    isDialogOpen: boolean;
    setIsDialogOpen: (value: boolean) => void;
    cardId: string;
    isClosed?: boolean;
    setSearchParams?: (params: URLSearchParams | ((prev: URLSearchParams) => URLSearchParams)) => void;
}
const priorityColors = {
    low: 'bg-green-500',
    medium: 'bg-yellow-500',
    high: 'bg-orange-500',
    urgent: 'bg-red-500'
};
const unifiedToEmoji = (unified: string) => {
    return String.fromCodePoint(...unified.split('-').map(u => parseInt(u, 16)));
}

const CardDetails = ({ isDialogOpen, setIsDialogOpen, cardId, isClosed, setSearchParams }: CardDetailsProps) => {
    const location = useLocation();
    const commentIdFromUrl = new URLSearchParams(location.search).get('comment');
    const commentRef = useRef<HTMLDivElement | null>(null);
    const user = useSelector((state: { auth: { user: IUser | null } }) => state.auth.user);
    const [addComment, { isLoading: isAddingComment }] = useAddCommentMutation()
    const [deleteComment, { isLoading: isDeletingComment }] = useDeleteCommentMutation()
    const [reactComment, { isLoading: isReactingComment }] = useReactCommentMutation()
    const { data: card, isLoading: isLoadingCard } = useGetCardQuery(cardId);
    const [newComment, setNewComment] = useState('');
    const [activeCommentId, setActiveCommentId] = useState<string | null>(null);

    const [selectTab, setSelectTab] = useState('comments');
    const getPriorityIcon = () => {
        return <Flag className={`h-3 w-3 ${priorityColors[card?.priority]}`} />;
    };
    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        const data = {
            cardId: card?._id,
            message: newComment,
        };

        try {
            await addComment(data).unwrap();
            setNewComment('');
        } catch (error) {
            console.error("Failed to add comment:", error);
        }
    };

    const handleReactComment = async (commentId: string, emoji: { unified: string }) => {
        const emojiChar = { emoji: unifiedToEmoji(emoji.unified), unified: emoji.unified };

        try {
            await reactComment({ commentId, emoji: emojiChar }).unwrap();
            setActiveCommentId(null); // Close picker after reaction
        } catch (error) {
            console.error("Failed to react to comment:", error);
        }
    };

    const [open, setOpen] = useState(false);
    const [commentAnchorEl, setCommentAnchorEl] = useState<HTMLElement | null>(null);
    const [commentIdToDelete, setCommentIdToDelete] = useState<string | null>(null);

    const handleDelete = async () => {
        if (!commentIdToDelete) return;

        try {
            await deleteComment({ commentId: commentIdToDelete }).unwrap();
            setOpen(false);
            setCommentIdToDelete(null);
            setCommentAnchorEl(null);
        } catch (err) {
            console.error("Delete failed:", err);
        }
    };

    useEffect(() => {
        if (commentIdFromUrl && card?.comments) {
            const commentElement = document.getElementById(`comment-${commentIdFromUrl}`);
            if (commentElement) {
                commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [commentIdFromUrl, card?.comments]);

    const handleClose = () => {
        setIsDialogOpen(false);
        if (setSearchParams) {
            setSearchParams(prev => {
                const newParams = new URLSearchParams(prev);
                newParams.delete('c');
                newParams.delete('comment');
                return newParams;
            });
        }
    };

    return (
        <>
            <Modal show={isDialogOpen} onClose={handleClose}>
                <ModalBody className='p-0'>
                    {isLoadingCard ?
                        <CardDetailsSkeleton />
                        : <div>
                            {card?.attachments?.length > 0 && card.attachments[0]?.url && card.attachments[0]?.type !== "pdf" ? (
                                <div className='h-40 w-full relative bg-slate-200 overflow-hidden rounded-lg'>
                                    <img src={card?.attachments[0]?.url} alt="" className='w-full h-full object-contain' />
                                    <button className="text-text1 absolute top-2 right-2" onClick={handleClose}>
                                        <X />
                                    </button>
                                </div>
                            )
                                : (<div className="flex items-center justify-between px-6 py-4 border-b border-border1">
                                    <h4 className="text-text1 text-lg lg:text-xl font-semibold">{card?.title}</h4>
                                    <button className="text-text1" onClick={handleClose}>
                                        <X />
                                    </button>
                                </div>
                                )}
                            <div className='px-6 py-4'>
                                <h4 className="text-text1 text-lg lg:text-xl font-semibold">{card?.title}</h4>
                                <p className="text-text2">{card?.description}</p>
                                <div className='grid grid-cols-2 mt-4'>
                                    <div className="flex items-center gap-1">
                                        {getPriorityIcon()}
                                        <span className="text-sm capitalize font-medium">{card?.priority} Priority</span>
                                    </div>
                                    {/* due date */}
                                    {card?.dueDate && (
                                        <div className="flex items-center gap-1">
                                            <span className="text-sm font-medium">Due Date:</span>
                                            <span className={`text-sm ${new Date(card?.dueDate) < new Date() ? 'text-red-500' : 'text-text2'}`}>
                                                {format(card?.dueDate, 'MMM d, yyyy')}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1">
                                        <span className="text-sm font-medium">Reporter:</span>
                                        <span className="text-sm text-text2">{card?.idCreator?.fullName}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="text-sm font-medium">Assigned to:</span>
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
                                    </div>
                                </div>
                                {card?.attachments && card.attachments.length > 0 &&
                                    <div className="flex flex-col gap-2 mt-4 border-t border-border pt-4">
                                        <h3 className="text-sm font-medium">Attachments</h3>
                                        {card?.attachments.map((item, index) => {
                                            return (
                                                <div className='flex items-center gap-2 justify-between' key={index}>
                                                    <Link to={item.url} target="_blank" rel="noopener noreferrer">
                                                        <div className='flex items-center gap-2'>
                                                            <div className='h-12 w-16 rounded overflow-hidden bg-gray-200'>
                                                                {item.name.toLowerCase().includes('.pdf') ? (
                                                                    <div className="w-full h-full flex items-center justify-center text-red-500 text-xs font-medium">
                                                                        PDF
                                                                    </div>
                                                                ) :
                                                                    <img
                                                                        src={item?.url}
                                                                        alt={`Attachment Preview ${index + 1}`}
                                                                        className="w-full h-full object-contain"
                                                                    />
                                                                }
                                                            </div>
                                                            <div>
                                                                <p className='text-sm text-gray-700'>{item.name}</p>
                                                                <p className='text-xs text-gray-500'>{format(new Date(item.createdAt), "MMM dd, yyyy")}</p>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                </div>
                                            );
                                        })}
                                    </div>
                                }
                                <div className="mt-4 border-t border-border pt-4">
                                    <div className='grid grid-cols-2 p-1 bg-gray-200/60 border border-border rounded'>
                                        <div className={`flex items-center gap-1 justify-center rounded py-1.5 px-2 text-sm cursor-pointer ${selectTab === 'comments' ? 'bg-white shadow' : ''}`} onClick={() => setSelectTab('comments')}>
                                            <MessageSquare size={16} /> Comments ({card?.comments?.length || 0})
                                        </div>
                                        <div className={`flex items-center gap-1 justify-center rounded py-1.5 px-2 text-sm cursor-pointer ${selectTab === 'activities' ? 'bg-white shadow' : ''}`} onClick={() => setSelectTab('activities')}>
                                            <Activity size={16} /> Activities (0)
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        {selectTab === 'comments' && (
                                            // write comments section
                                            <>
                                                {!isClosed &&
                                                    <div className="flex flex-col items-center gap-2 mb-4">
                                                        <textarea
                                                            className="w-full p-2 border border-gray-300 rounded"
                                                            placeholder="Write a comment..."
                                                            value={newComment}
                                                            onChange={(e) => setNewComment(e.target.value)}
                                                        />
                                                        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full disabled:opacity-50 disabled:cursor-not-allowed" onClick={handleAddComment} disabled={!newComment.trim() || isAddingComment}>
                                                            {isAddingComment ? "Posting..." : "Post Comment"}
                                                        </button>
                                                    </div>
                                                }
                                                {/* Comments List */}
                                                {card?.comments?.length > 0 ? (
                                                    <div className="space-y-3">
                                                        {card.comments.map((comment, index) => (
                                                            <div
                                                                key={index}
                                                                id={`comment-${comment._id}`}
                                                                ref={comment._id === commentIdFromUrl ? commentRef : null}
                                                                className={`p-3 rounded shadow-sm ${comment._id === commentIdFromUrl ? 'border-l-2 border-blue-500 bg-blue-100' : 'bg-gray-100'}`}
                                                            >
                                                                <div className="flex items-start gap-3">
                                                                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center">
                                                                        {comment?.userId?.initials}
                                                                    </div>
                                                                    <div>
                                                                        <p className="flex items-center gap-2">
                                                                            <span className="font-medium">{comment.userId.fullName}</span>
                                                                            <span className="text-xs text-text2">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                                                                        </p>
                                                                        <p className="text-sm text-text2">{comment.message}</p>
                                                                        <div className='mt-2 flex items-center gap-2'>
                                                                            {/* show button emoji icon for reactions */}
                                                                            {comment.reactions && comment.reactions.length > 0 && (
                                                                                <div className="flex flex-wrap gap-1">
                                                                                    {comment.reactions.map((r, i) => (
                                                                                        <button
                                                                                            key={i}
                                                                                            className="text-sm px-2 py-1 bg-white border rounded-full shadow-sm hover:border-gray-300 hover:bg-gray-200 duration-300"
                                                                                            onClick={() => handleReactComment(comment._id, { unified: r.emoji.unified })}
                                                                                            title={
                                                                                                r.userIds?.length
                                                                                                    ? formatReactedUsersTooltip(r.userIds, user?._id, r.emoji?.emoji)
                                                                                                    : ''
                                                                                            }
                                                                                        >
                                                                                            {r.emoji?.emoji} {r.count}
                                                                                        </button>
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                            <div className='relative'>
                                                                                <button
                                                                                    className="text-gray-600 border border-gray-400 px-2 py-1 rounded-full hover:bg-gray-200 duration-300"
                                                                                    onClick={() => setActiveCommentId(comment._id === activeCommentId ? null : comment._id)}
                                                                                >
                                                                                    <SmilePlus size={14} />
                                                                                </button>

                                                                                {activeCommentId === comment._id && (
                                                                                    <div className="absolute bottom-[110%] z-10 mt-2">
                                                                                        <EmojiPicker
                                                                                            onEmojiClick={(emoji) => handleReactComment(comment._id, emoji)}
                                                                                            height={350}
                                                                                            width={280}
                                                                                        />
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            {comment.userId._id === user?._id && (
                                                                                <>
                                                                                    <span className='inline-block w-1 h-1 rounded bg-gray-600'></span>
                                                                                    <>
                                                                                        <button className='text-xs hover:text-red-600 underline' onClick={(e) => { setOpen(true); setCommentIdToDelete(comment._id); setCommentAnchorEl(e.currentTarget) }} color="error">
                                                                                            Delete
                                                                                        </button>

                                                                                        <ConfirmPopup
                                                                                            title='Delete Comment'
                                                                                            des='Deleting a comment is forever. There is no undo.'
                                                                                            btnText='Delete'
                                                                                            anchorEl={commentAnchorEl}
                                                                                            isOpen={open}
                                                                                            onClose={() => setOpen(false)}
                                                                                            onConfirm={handleDelete}
                                                                                            isLoading={isDeletingComment}
                                                                                        />
                                                                                    </>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-text2">No comments yet.</p>
                                                )}
                                            </>
                                        )}
                                        {selectTab === 'activities' && (
                                            <div className="space-y-3">
                                                {/* Activities Section */}
                                                <p className="text-sm text-text2">No activities yet.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    }
                </ModalBody>
            </Modal >
        </>
    )
}

export default CardDetails