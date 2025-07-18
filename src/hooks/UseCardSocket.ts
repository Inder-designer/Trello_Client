import { useEffect } from "react";
import { socket } from "@/utils/socket";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/redux/store/store";
import { cardApi } from "@/redux/api/Card";


export const useCardSocket = (boardId?: string) => {
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        if (!boardId) return;
        // handleAddComment
        const handleAddComment = (comment: any) => {
            dispatch(cardApi.util.updateQueryData("getCard", comment.cardId, (draft: any) => {
                draft.comments.push(comment);
            }));
        };
        socket.on("addComment", handleAddComment);

        return () => {
            socket.off("addComment", handleAddComment);
        };
    }, [dispatch, boardId]);
};
