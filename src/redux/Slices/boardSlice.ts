import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    boardData: null,
};

const boardStateSlice = createSlice({
    name: "boardState",
    initialState,
    reducers: {
        setBoardData(state, action) {
            state.boardData = action.payload;
        },
        updateJoinRequest(state, action) {
            const { data } = action.payload;
            if (!state.boardData) {
                state.boardData = { joinRequests: [] };
            }

            if (!state.boardData.joinRequests) {
                state.boardData.joinRequests = [];
            }

            if (Array.isArray(data)) {
                state.boardData.joinRequests = [...state.boardData.joinRequests, ...data];
            } else {
                state.boardData.joinRequests.push(data);
            }
        },
        addNewList(state, action) {
            const newList = {
                ...action.payload,
                cards: [],
            };

            if (state.boardData && Array.isArray(state.boardData.lists)) {
                state.boardData.lists.push(newList);
            }
        },
        changeListTitle(state, action) {
            const { title, listId } = action.payload;
            const list = state.boardData.lists.find((l) => l._id === listId)
            if (list) {
                list.title = title;
            }
        },
        removeList(state, action) {
            const { listId } = action.payload;
            state.boardData.lists = state.boardData.lists.filter((list) => list._id !== listId);
        },
        addNewCard(state, action) {
            const { card } = action.payload;
            const list = state.boardData.lists.find((l) => l._id === card.listId);
            if (list) {
                list.cards.push(card);
            }
        },
        updateCard(state, action) {
            const { card } = action.payload;
            const listIndex = state.boardData.lists.findIndex(list => list._id === card.listId);
            if (listIndex !== -1) {
                const cardIndex = state.boardData.lists[listIndex].cards.findIndex(c => c._id === card._id);
                if (cardIndex !== -1) {
                    state.boardData.lists[listIndex].cards[cardIndex] = card;
                }
            }
        },
        moveCard(state, action) {
            const { cardId, fromListId, toListId } = action.payload;

            const fromList = state.boardData.lists.find((l) => l._id === fromListId);
            const toList = state.boardData.lists.find((l) => l._id === toListId);

            if (!fromList || !toList) return;

            const cardIndex = fromList.cards.findIndex((c) => c._id === cardId);
            if (cardIndex === -1) return;

            const [card] = fromList.cards.splice(cardIndex, 1);

            card.listId = toListId;

            toList.cards.push(card);
        },
        removeCard(state, action) {
            const { cardId, listId } = action.payload;
            const list = state.boardData.lists.find((l) => l._id === listId);
            if (list) list.cards = list.cards.filter((c) => c._id !== cardId);
        },
    },
});

export const { setBoardData, updateJoinRequest, addNewList, changeListTitle, removeList, updateCard, addNewCard, moveCard, removeCard } = boardStateSlice.actions;
export default boardStateSlice.reducer;
