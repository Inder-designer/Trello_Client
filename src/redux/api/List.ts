import { ApiResponse } from "../../Types/ApiResponse";
import { baseApi } from "../baseApi";
import { LIST_CREATE, LIST_DELETE, LIST_UPDATE } from "../routes/routes";

export const listApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createList: builder.mutation({
            query: (data) => ({
                url: LIST_CREATE,
                method: 'POST',
                body: data
            }),
            transformResponse: (response: ApiResponse) => response.data,
            // invalidatesTags: ["BOARD"]
        }),
        updateList: builder.mutation({
            query: ({ data, listId }) => ({
                url: LIST_UPDATE(listId),
                method: 'PATCH',
                body: data
            }),
            transformResponse: (response: ApiResponse) => response.data,
        }),
        deleteList: builder.mutation({
            query: (listId) => ({
                url: LIST_DELETE(listId),
                method: 'DELETE',
            }),
            transformResponse: (response: ApiResponse) => response.data,
        }),
    }),
});

export const { useCreateListMutation, useUpdateListMutation, useDeleteListMutation } = listApi;