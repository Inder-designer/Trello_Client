import { ApiResponse } from "../../Types/ApiResponse";
import { baseApi } from "../baseApi";
import { CARD_COMMENT_ADD, CARD_COMMENT_REACT, CARD_CREATE, CARD_DELETE, CARD_GET, CARD_GET_ALL, CARD_MOVE, CARD_UPDATE } from "../routes/routes";

export const cardApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createCard: builder.mutation({
            query: (data) => ({
                url: CARD_CREATE,
                method: 'POST',
                body: data
            }),
            transformResponse: (response: ApiResponse) => response.data,
            // invalidatesTags: ["BOARD"]
        }),
        updateCard: builder.mutation({
            query: ({ data, cardID }) => ({
                url: CARD_UPDATE(cardID),
                method: 'PATCH',
                body: data
            }),
            transformResponse: (response: ApiResponse) => response.data,
        }),
        moveCard: builder.mutation({
            query: ({ data, cardId }) => ({
                url: CARD_MOVE(cardId),
                method: 'PATCH',
                body: data
            }),
            transformResponse: (response: ApiResponse) => response.data,
        }),
        deleteCard: builder.mutation({
            query: ({ cardId }) => ({
                url: CARD_DELETE(cardId),
                method: 'DELETE',
            }),
            transformResponse: (response: ApiResponse) => response.data,
        }),
        getCards: builder.query({
            query: (id) => CARD_GET_ALL(id)
        }),
        getCard: builder.query({
            query: (id) => CARD_GET(id),
            transformResponse: (response: ApiResponse) => response.data,
            providesTags: (_res, _err, id) => [{ type: 'Card' as const, id }],
        }),
        addComment: builder.mutation({
            query: (data) => ({
                url: CARD_COMMENT_ADD,
                method: 'POST',
                body: data
            }),
            transformResponse: (response: ApiResponse) => response.data,
        }),
        reactComment: builder.mutation({
            query: (data) => ({
                url: CARD_COMMENT_REACT,
                method: 'POST',
                body: data
            }),
            transformResponse: (response: ApiResponse) => response.data,
        }),
    }),
});

export const { useCreateCardMutation, useGetCardsQuery, useUpdateCardMutation, useMoveCardMutation, useDeleteCardMutation, useGetCardQuery, useAddCommentMutation, useReactCommentMutation } = cardApi;