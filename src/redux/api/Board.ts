import { ApiResponse } from "../../Types/ApiResponse";
import { baseApi } from "../baseApi";
import { BOARD_CREATE, BOARD_DELETE, BOARD_GET, BOARD_GET_ALL, BOARD_UPDATE, INVITE_ACCEPT, INVITE_GENERATE, INVITE_LINK_DELETE, INVITE_LINK_VERIFY, REQUEST_JOIN, REQUEST_STATUS } from "../routes/routes";

export const boardApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createBoard: builder.mutation({
            query: (data) => ({
                url: BOARD_CREATE,
                method: 'POST',
                body: data
            }),
            transformResponse: (response: ApiResponse) => response.data,
            invalidatesTags: ["BOARDS"]
        }),
        updateBoard: builder.mutation({
            query: ({ id, values }) => ({
                url: BOARD_UPDATE(id),
                method: 'PATCH',
                body: values
            }),
            transformResponse: (response: ApiResponse) => response.data,
            invalidatesTags: ["BOARDS"]
        }),
        deleteBoard: builder.mutation({
            query: (id) => ({
                url: BOARD_DELETE(id),
                method: 'DELETE',
            }),
            transformResponse: (response: ApiResponse) => response.data,
            invalidatesTags: ["BOARDS"]
        }),
        getAllBoards: builder.query({
            query: () => BOARD_GET_ALL,
            transformResponse: (response: ApiResponse) => response.data,
            providesTags: ["BOARDS"]
        }),
        getBoard: builder.query({
            query: (id) => BOARD_GET(id),
            transformResponse: (response: ApiResponse) => response.data,
            providesTags: ["BOARD"]
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
    }),
});

export const { useGetAllBoardsQuery, useCreateBoardMutation, useDeleteBoardMutation, useUpdateBoardMutation, useGetBoardQuery, useGenerateInviteMutation, useDeleteInviteLinkMutation, useVerifyInviteLinkMutation, useAcceptInviteMutation, useRequestJoinMutation, useRequestStatusQuery } = boardApi;