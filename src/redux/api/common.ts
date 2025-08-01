import { ApiResponse } from "../../Types/ApiResponse";
import { baseApi } from "../baseApi";
import { NOTIFICATION_GET, NOTIFICATION_READ, UPLOAD_MULTI, UPLOAD_SINGLE } from "../routes/routes";

export const carApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        uploadSingle: builder.mutation({
            query: (formData) => ({
                url: UPLOAD_SINGLE,
                method: 'POST',
                body: formData
            }),
            transformResponse: (response: ApiResponse) => response.data
        }),
        uploadMulti: builder.mutation({
            query: (formData) => ({
                url: UPLOAD_MULTI,
                method: 'POST',
                body: formData
            }),
            transformResponse: (response: ApiResponse) => response.data
        }),
        notifications: builder.query({
            query: ({ page, limit, unRead }) => {
                console.log(`Fetching notifications with unRead=${unRead}`);
                return (`${NOTIFICATION_GET}?page=${page}&limit=${limit}${unRead ? '&unRead=true' : ''}`)
            },
            transformResponse: (response: ApiResponse) => response.data
        }),
        notificationRead: builder.mutation({
            query: (notificationId: string) => ({
                url: NOTIFICATION_READ,
                method: 'POST',
                body: { notificationId }
            }),
            transformResponse: (response: ApiResponse) => response.data
        }),
    }),
});

export const { useUploadSingleMutation, useUploadMultiMutation, useNotificationsQuery, useNotificationReadMutation } = carApi;