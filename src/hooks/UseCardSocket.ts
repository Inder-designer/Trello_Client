import { useEffect } from "react";
import { socket } from "@/utils/socket";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/redux/store/store";
import { cardApi } from "@/redux/api/Card";
import { boardApi } from "@/redux/api/Board";
import { IBoard } from "@/Types/IBoard";
import { ICard, IComment } from "@/Types/ICard";


export const useCardSocket = (boardIds?: string[]) => {
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        if (!boardIds || boardIds.length === 0) return;

        const listeners: { event: string; handler: (...args: any[]) => void }[] = [];

        boardIds.forEach((boardId) => {
            // handleAddComment
            const handleAddComment = ({ card, comment }) => {
                console.log("Comment added:", card, comment);

                dispatch(cardApi.util.updateQueryData("getCard", comment.cardId, (draft: ICard) => {
                    // set in first position  
                    draft.comments.unshift(comment);
                    draft.commentCounts = (draft.commentCounts || 0) + 1;
                }));
                dispatch(
                    boardApi.util.updateQueryData(
                        "getBoard",
                        boardId,
                        (draft: IBoard) => {
                            const list = draft.lists.find((l) => l._id === card.listId);
                            // update card commentCounts
                            if (list) {
                                const card = list.cards.find((c) => c._id === comment.cardId);
                                if (card) {
                                    card.commentCounts = (card.commentCounts || 0) + 1;
                                }
                            }
                        }
                    )
                )
            };

            const handleCommentReacted = (comment: IComment) => {
                console.log("Comment reacted:", comment);
                dispatch(cardApi.util.updateQueryData("getCard", comment.cardId, (draft: ICard) => {
                    const commentIndex = draft.comments.findIndex(c => c._id === comment._id)
                    if (commentIndex !== -1) {
                        draft.comments[commentIndex].reactions = comment.reactions;
                    }
                }));
            }
            const handleDeleteComment = (comment: IComment) => {
                console.log("Comment deleted:", comment);
                dispatch(cardApi.util.updateQueryData("getCard", comment.cardId._id, (draft: ICard) => {
                    draft.comments = draft.comments.filter(c => c._id !== comment._id);
                    draft.commentCounts = (draft.commentCounts || 0) - 1;
                }));
                dispatch(
                    boardApi.util.updateQueryData(
                        "getBoard",
                        boardId,
                        (draft: IBoard) => {
                            const list = draft.lists.find((l) => l.cards.some(c => c._id === comment.cardId._id));
                            if (list) {
                                const card = list.cards.find((c) => c._id === comment.cardId._id);
                                if (card) {
                                    card.commentCounts = (card.commentCounts || 0) - 1;
                                }
                            }
                        }
                    )
                )
            };

            const boardListeners = [
                { event: `commentAdded:${boardId}`, handler: handleAddComment },
                { event: `commentDeleted:${boardId}`, handler: handleDeleteComment },
                { event: `commentReacted:${boardId}`, handler: handleCommentReacted },
            ];

            boardListeners.forEach(({ event, handler }) => {
                socket.on(event, handler);
                listeners.push({ event, handler });
            });
        })

        return () => {
            listeners.forEach(({ event, handler }) => {
                socket.off(event, handler);
            });
        };
    }, [dispatch, boardIds]);
};
