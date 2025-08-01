import { useEffect } from "react";
import { socket } from "@/utils/socket";
import { useDispatch } from "react-redux";
import { addNewCard, changeListTitle, moveCard, removeCard, removeList, updateCard } from "@/redux/Slices/boardSlice";
import { boardApi } from "@/redux/api/Board";
import type { AppDispatch } from "@/redux/store/store";
import { ICard } from "@/Types/ICard";
import { cardApi } from "@/redux/api/Card";
import { IList } from "@/Types/IList";
import { IBoard } from "@/Types/IBoard";

interface CardMovedPayload {
    cardId: string;
    fromListId: string;
    toListId: string;
}

export const useBoardSocket = (boardIds?: string[]) => {
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        if (!boardIds || boardIds.length === 0) return;

        const listeners: { event: string; handler: (...args: any[]) => void }[] = [];

        boardIds.forEach((boardId) => {
            const handleJoinRequest = (data: { userId: string; boardId: string }) => {
                console.log("Join request received:", data);
                dispatch(
                    boardApi.util.updateQueryData("getBoard", boardId, (draft: IBoard) => {
                        if (!draft.joinRequests) draft.joinRequests = [];
                        draft.joinRequests.push(data);
                    })
                )
            };

            const handleBoardClosureToggled = (data: { boardId: string; isClosed: boolean }) => {
                dispatch(
                    boardApi.util.updateQueryData("getBoard", data.boardId, (draft: IBoard) => {
                        draft.isClosed = data.isClosed;
                    })
                );
                dispatch(
                    boardApi.util.updateQueryData("getAllBoards", {}, (draft: any) => {
                        const allBoards = [
                            ...(draft.ownedBoards || []),
                            ...(draft.memberBoards || [])
                        ];
                        const board = allBoards.find(b => b._id === data.boardId);
                        if (!board) return;
                        board.isClosed = data.isClosed;
                    })
                );
            };

            const handleMemberLeft = (data: { memberId: string; boardId: string }) => {
                dispatch(
                    boardApi.util.updateQueryData("getBoard", boardId, (draft: IBoard) => {
                        draft.members = draft.members.filter(member => member._id !== data.memberId);
                    })
                );
                dispatch(
                    boardApi.util.updateQueryData("getAllBoards", {}, (draft: any) => {
                        const allBoards = [
                            ...(draft.ownedBoards || []),
                            ...(draft.memberBoards || [])
                        ];
                        const board = allBoards.find(b => b._id === boardId);
                        if (!board) return;
                        board.members = board.members.filter(member => member !== data.memberId);
                    })
                );
            };

            const handleBoardUpdated = (updatedBoard: IBoard) => {
                console.log("Board updated:", updatedBoard);
                dispatch(
                    boardApi.util.updateQueryData("getBoard", boardId, (draft: IBoard) => {
                        draft.title = updatedBoard.title;
                        draft.description = updatedBoard.description;
                        draft.background = updatedBoard.background;
                    })
                );
                dispatch(boardApi.util.updateQueryData("getAllBoards", {}, (draft: any) => {
                    const boardIndex = draft.memberBoards.findIndex(b => b._id === updatedBoard._id);
                    if (boardIndex !== -1) {
                        draft.memberBoards[boardIndex] = updatedBoard;
                    }
                }))
            }

            const handleCardMoved = ({ cardId, fromListId, toListId }: CardMovedPayload) => {
                dispatch(
                    boardApi.util.updateQueryData(
                        "getBoard",
                        boardId,
                        (draft: IBoard) => {
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

            const handleCardCreate = (card: ICard) => {
                console.log("Card created:", card);
                dispatch(
                    boardApi.util.updateQueryData("getAllBoards", {}, (draft: any) => {
                        const allBoards = [
                            ...(draft.ownedBoards || []),
                            ...(draft.memberBoards || [])
                        ];
                        const board = allBoards.find(b => b._id === boardId);
                        if (!board) return;
                        board.cardCounts = (board.cardCounts || 0) + 1;
                    })
                );

                dispatch(
                    boardApi.util.updateQueryData(
                        "getBoard",
                        boardId,
                        (draft: IBoard) => {
                            const list = draft.lists.find((l) => l._id === card.listId);
                            if (list) {
                                list.cards.push(card);
                            }
                        }
                    )
                );
            };

            const handleCardUpdated = (updatedCard: ICard) => {
                dispatch(
                    boardApi.util.updateQueryData(
                        "getBoard",
                        boardId,
                        (draft: IBoard) => {
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
                dispatch(
                    cardApi.util.updateQueryData("getCard", updatedCard._id, (draft: ICard) => {
                        Object.assign(draft, updatedCard);
                    })
                );
            };

            const handleCardRemoved = ({ cardId, listId }) => {
                console.log("Card removed:", cardId, listId);
                dispatch(
                    boardApi.util.updateQueryData("getAllBoards", {}, (draft: any) => {
                        const allBoards = [
                            ...(draft.ownedBoards || []),
                            ...(draft.memberBoards || [])
                        ];
                        const board = allBoards.find(b => b._id === boardId);
                        if (!board) return;
                        board.cardCounts = (board.cardCounts || 0) - 1;
                    })
                );
                dispatch(
                    boardApi.util.updateQueryData(
                        "getBoard",
                        boardId,
                        (draft: IBoard) => {
                            const list = draft.lists.find((l) => l._id === listId);
                            if (list) {
                                list.cards = list.cards.filter((c) => c._id !== cardId);
                            }
                        }
                    )
                );
            };

            const handleListCreate = (list: IList) => {
                dispatch(
                    boardApi.util.updateQueryData("getAllBoards", {}, (draft: any) => {
                        const allBoards = [
                            ...(draft.ownedBoards || []),
                            ...(draft.memberBoards || [])
                        ]
                        const board = allBoards.find(b => b._id === boardId);
                        if (!board) return;
                        board.lists.push(list._id);
                    })
                );
                dispatch(
                    boardApi.util.updateQueryData(
                        "getBoard",
                        boardId,
                        (draft: IBoard) => {
                            draft.lists.push({
                                ...list,
                                cards: [],
                            });
                        }
                    )
                );
            };

            const handleListUpdate = (updatedList: IList) => {
                console.log("List updated:", updatedList);

                dispatch(
                    boardApi.util.updateQueryData(
                        "getBoard",
                        boardId,
                        (draft: IBoard) => {
                            const existingList = draft.lists.find((l) => l._id === updatedList._id);
                            if (existingList) {
                                Object.assign(existingList, updatedList);
                            }
                        }
                    )
                );
            };

            const handleListRemove = ({ listId, cardCounts }: { listId: string, cardCounts: number }) => {
                dispatch(
                    boardApi.util.updateQueryData("getAllBoards", {}, (draft: any) => {
                        const allBoards = [
                            ...(draft.ownedBoards || []),
                            ...(draft.memberBoards || [])
                        ]
                        const board = allBoards.find(b => b._id === boardId);
                        if (!board) return;
                        board.cardCounts = (board.cardCounts || 0) - cardCounts;
                        board.lists = board.lists.filter(l => l !== listId);
                    })
                );
                dispatch(
                    boardApi.util.updateQueryData(
                        "getBoard",
                        boardId,
                        (draft: IBoard) => {
                            const listIndex = draft.lists.findIndex((l) => l._id === listId);
                            if (listIndex !== -1) {
                                draft.lists.splice(listIndex, 1);
                            }
                        }
                    )
                );
            };

            const boardListeners = [
                { event: `joinRequest:${boardId}`, handler: handleJoinRequest },
                { event: `memberLeft:${boardId}`, handler: handleMemberLeft },
                { event: `boardClosureToggled:${boardId}`, handler: handleBoardClosureToggled },
                { event: `boardUpdated:${boardId}`, handler: handleBoardUpdated },
                { event: `cardCreate:${boardId}`, handler: handleCardCreate },
                { event: `cardUpdated:${boardId}`, handler: handleCardUpdated },
                { event: `cardMoved:${boardId}`, handler: handleCardMoved },
                { event: `cardRemoved:${boardId}`, handler: handleCardRemoved },
                { event: `listCreate:${boardId}`, handler: handleListCreate },
                { event: `listUpdate:${boardId}`, handler: handleListUpdate },
                { event: `listRemove:${boardId}`, handler: handleListRemove },
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
