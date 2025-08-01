import { IBoard } from "@/Types/IBoard";
import { ApiResponse } from "../../Types/ApiResponse";
import { baseApi } from "../baseApi";
import { BOARD_CLOSE_TOGGLE, BOARD_CREATE, BOARD_DELETE, BOARD_GET, BOARD_GET_ALL, BOARD_LEAVE, BOARD_UPDATE, INVITE_ACCEPT, INVITE_GENERATE, INVITE_LINK_DELETE, INVITE_LINK_VERIFY, REQUEST_ACTION, REQUEST_JOIN, REQUEST_STATUS } from "../routes/routes";

export const boardApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAllBoards: builder.query({
            query: () => BOARD_GET_ALL,
            transformResponse: (response: ApiResponse) => response.data,

        }),
        createBoard: builder.mutation({
            query: (data) => ({
                url: BOARD_CREATE,
                method: 'POST',
                body: data
            }),
            transformResponse: (response: ApiResponse) => response.data,
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(
                        boardApi.util.updateQueryData('getAllBoards', {}, (draft) => {
                            if (!draft.ownedBoards) draft.ownedBoards = [];
                            draft.ownedBoards.push(data);
                        })
                    );
                } catch (error) {
                    console.error("Failed to create board:", error);
                }
            },
        }),
        updateBoard: builder.mutation({
            query: ({ id, values }) => ({
                url: BOARD_UPDATE(id),
                method: 'PATCH',
                body: values
            }),
            transformResponse: (response: ApiResponse) => response.data,
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(
                        boardApi.util.updateQueryData('getAllBoards', {}, (draft) => {
                            const index = draft.ownedBoards.findIndex(board => board._id === arg.id);
                            if (index !== -1) {
                                draft.ownedBoards[index] = data;
                            }
                        })
                    );
                } catch (error) {
                    console.error("Failed to update board:", error);
                }
            },
        }),
        deleteBoard: builder.mutation({
            query: (id) => ({
                url: BOARD_DELETE(id),
                method: 'DELETE',
            }),
            transformResponse: (response: ApiResponse) => response.data,
            invalidatesTags: ["BOARDS"]
        }),
        toggleBoardClose: builder.mutation({
            query: (id) => ({
                url: BOARD_CLOSE_TOGGLE(id),
                method: 'PUT',
            }),
            transformResponse: (response: ApiResponse) => response.data,
        }),
        getBoard: builder.query({
            query: (id) => BOARD_GET(id),
            transformResponse: (response: ApiResponse) => response.data,
            providesTags: ["BOARD"]
        }),
        leaveBoard: builder.mutation({
            query: (id) => ({
                url: BOARD_LEAVE(id),
                method: 'POST',
            }),
            transformResponse: (response: ApiResponse) => response.data,
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(
                        boardApi.util.updateQueryData('getAllBoards', {}, (draft) => {
                            draft.memberBoards = draft.memberBoards.filter(board => board._id !== arg);
                        })
                    );
                    dispatch(
                        boardApi.util.updateQueryData('getBoard', arg, (draft: IBoard) => {
                            draft.isLeave = true;
                        })
                    );
                } catch (error) {
                    console.error("Failed to leave board:", error);
                }
            }
        }),
        generateInvite: builder.mutation({
            query: (id) => ({
                url: INVITE_GENERATE(id),
                method: 'POST',
            }),
            transformResponse: (response: ApiResponse) => response.data,
        }),
        deleteInviteLink: builder.mutation({
            query: (id) => ({
                url: INVITE_LINK_DELETE(id),
                method: 'DELETE',
            }),
            transformResponse: (response: ApiResponse) => response.data,
        }),
        verifyInviteLink: builder.mutation({
            query: (token) => ({
                url: INVITE_LINK_VERIFY,
                method: 'POST',
                body: token
            }),
            transformResponse: (response: ApiResponse) => response.data,
        }),
        acceptInvite: builder.mutation({
            query: (token) => ({
                url: INVITE_ACCEPT,
                method: 'POST',
                body: token
            }),
            transformResponse: (response: ApiResponse) => response.data,
        }),
        requestJoin: builder.mutation({
            query: (boardId) => ({
                url: REQUEST_JOIN,
                method: 'POST',
                body: boardId
            }),
            transformResponse: (response: ApiResponse) => response.data,
        }),
        requestStatus: builder.query({
            query: (id) => REQUEST_STATUS(id),
            transformResponse: (response: ApiResponse) => response.data,
        }),
        requestAction: builder.mutation({
            query: ({ request, action, id }) => ({
                url: REQUEST_ACTION(id),
                method: 'POST',
                body: { action }
            }),
            transformResponse: (response: ApiResponse) => response.data,
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    const boardId = arg.request.boardId;
                    const requestBy = arg.request.requestBy;
                    dispatch(
                        boardApi.util.updateQueryData('getAllBoards', {}, (draft) => {
                            const board = draft.ownedBoards.find(b => b._id === boardId);
                            if (!board || arg.action === 'reject') return;
                            const alreadyMember = board.members.some(m => m._id === requestBy._id);
                            if (!alreadyMember) board.members.push(requestBy._id);
                        })
                    )
                    dispatch(
                        boardApi.util.updateQueryData('getBoard', boardId, (draft: IBoard) => {
                            const req = draft.joinRequests.find(req => req._id === arg.id)
                            if (!req) return;
                            if (arg.action === 'accept') {
                                const alreadyMember = draft.members.some(m => m._id === requestBy._id);
                                if (!alreadyMember) draft.members.push(requestBy);
                            }
                            draft.joinRequests = draft.joinRequests.filter(req => req._id !== arg.id);
                        })
                    );
                } catch (error) {
                    console.error("Failed to perform request action:", error);
                }
            },
        }),
    }),
});

export const { useGetAllBoardsQuery, useCreateBoardMutation, useDeleteBoardMutation, useUpdateBoardMutation, useGetBoardQuery, useGenerateInviteMutation, useDeleteInviteLinkMutation, useVerifyInviteLinkMutation, useAcceptInviteMutation, useRequestJoinMutation, useRequestStatusQuery, useRequestActionMutation, useLeaveBoardMutation, useToggleBoardCloseMutation } = boardApi;