import { useEffect } from "react";
import { socket } from "@/utils/socket";
import { useDispatch } from "react-redux";
import { addNewCard, changeListTitle, moveCard, removeCard, removeList, updateCard } from "@/redux/Slices/boardSlice";
import { boardApi } from "@/redux/api/Board";
import type { AppDispatch } from "@/redux/store/store";

interface CardMovedPayload {
    cardId: string;
    fromListId: string;
    toListId: string;
}

export const useBoardSocket = (boardId?: string) => {
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        if (!boardId) return;

        const handleCardMoved = ({ cardId, fromListId, toListId }: CardMovedPayload) => {
            // 1. Update reducer
            // dispatch(moveCard({ cardId, fromListId, toListId }));

            dispatch(
                boardApi.util.updateQueryData(
                    "getBoard",
                    boardId,
                    (draft: {
                        lists: Array<{
                            _id: string;
                            cards: Array<{ _id: string;[key: string]: any }>;
                            [key: string]: any;
                        }>;
                        [key: string]: any;
                    }) => {
                        const fromList = draft.lists.find((l) => l._id === fromListId);
                        const toList = draft.lists.find((l) => l._id === toListId);

                        if (!fromList || !toList) return;

                        const cardIndex = fromList.cards.findIndex((c) => c._id === cardId);
                        if (cardIndex === -1) return;
                        const [card] = fromList.cards.splice(cardIndex, 1);
                        card.listId = toListId;

                        // Push the updated card into new list
                        toList.cards.push(card);
                    }
                )
            );
        };

        const handleCardCreate = (card: any) => {
            dispatch(addNewCard({ card: card }));
            dispatch(
                boardApi.util.updateQueryData(
                    "getBoard",
                    boardId,
                    (draft: {
                        lists: Array<{
                            _id: string;
                            cards: Array<{ _id: string;[key: string]: any }>;
                            [key: string]: any;
                        }>;
                        [key: string]: any;
                    }) => {
                        const list = draft.lists.find((l) => l._id === card.listId);
                        if (list) {
                            list.cards.push(card);
                        }
                    }
                )
            );
        };
        const handleCardUpdated = (updatedCard: any) => {
            console.log("Card updated:", updatedCard);
            dispatch(updateCard({ card: updatedCard }));
            dispatch(
                boardApi.util.updateQueryData(
                    "getBoard",
                    boardId,
                    (draft: {
                        lists: Array<{
                            _id: string;
                            cards: Array<{ _id: string;[key: string]: any }>;
                            [key: string]: any;
                        }>;
                        [key: string]: any;
                    }) => {
                        const list = draft.lists.find((l) => l._id === updatedCard.listId);
                        if (list) {
                            const cardIndex = list.cards.findIndex((c) => c._id === updatedCard._id);
                            if (cardIndex !== -1) {
                                list.cards[cardIndex] = updatedCard;
                            }
                        }
                    }
                )
            );
        };

        const handleCardRemoved = ({ cardId, listId }) => {
            console.log("Card removed:", cardId, listId);
            dispatch(removeCard({ cardId, listId }));
            dispatch(
                boardApi.util.updateQueryData(
                    "getBoard",
                    boardId,
                    (draft: {
                        lists: Array<{
                            _id: string;
                            cards: Array<{ _id: string;[key: string]: any }>;
                            [key: string]: any;
                        }>;
                        [key: string]: any;
                    }) => {
                        const list = draft.lists.find((l) => l._id === listId);
                        if (list) {
                            list.cards = list.cards.filter((c) => c._id !== cardId);
                        }
                    }
                )
            );
        };

        const handleListCreate = (list: any) => {
            dispatch(
                boardApi.util.updateQueryData(
                    "getBoard",
                    boardId,
                    (draft: {
                        lists: Array<{
                            _id: string;
                            cards: Array<{ _id: string;[key: string]: any }>;
                            [key: string]: any;
                        }>;
                        [key: string]: any;
                    }) => {
                        draft.lists.push({
                            ...list,
                            cards: [],
                        });
                    }
                )
            );
        };

        const handleListUpdate = (updatedList: any) => {
            dispatch(changeListTitle({ title: updatedList.title, listId: updatedList?._id }))
            dispatch(
                boardApi.util.updateQueryData(
                    "getBoard",
                    boardId,
                    (draft: {
                        lists: Array<{
                            _id: string;
                            cards: Array<{ _id: string;[key: string]: any }>;
                            [key: string]: any;
                        }>;
                        [key: string]: any;
                    }) => {
                        const existingList = draft.lists.find((l) => l._id === updatedList._id);
                        if (existingList) {
                            Object.assign(existingList, updatedList);
                        }
                    }
                )
            );
        };

        const handleListRemove = (listId: string) => {
            dispatch(removeList({ listId }));
            dispatch(
                boardApi.util.updateQueryData(
                    "getBoard",
                    boardId,
                    (draft: {
                        lists: Array<{
                            _id: string;
                            cards: Array<{ _id: string;[key: string]: any }>;
                            [key: string]: any;
                        }>;
                        [key: string]: any;
                    }) => {
                        const listIndex = draft.lists.findIndex((l) => l._id === listId);
                        if (listIndex !== -1) {
                            draft.lists.splice(listIndex, 1);
                        }
                    }
                )
            );
        };

        socket.on("cardCreate", handleCardCreate);
        socket.on("cardUpdated", handleCardUpdated);
        socket.on("cardMoved", handleCardMoved);
        socket.on("cardRemoved", handleCardRemoved);
        socket.on("listCreate", handleListCreate);
        socket.on("listUpdate", handleListUpdate);
        socket.on("listRemove", handleListRemove);

        return () => {
            socket.off("cardCreate", handleCardCreate);
            socket.off("cardUpdated", handleCardUpdated);
            socket.off("cardMoved", handleCardMoved);
            socket.off("cardRemoved", handleCardRemoved);
            socket.off("listCreate", handleListCreate);
            socket.off("listUpdate", handleListUpdate);
            socket.off("listRemove", handleListRemove);
        };
    }, [dispatch, boardId]);
};
