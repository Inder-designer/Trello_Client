import { ApiResponse } from "../../Types/ApiResponse";
import { baseApi } from "../baseApi";
import { UPLOAD_MULTI, UPLOAD_SINGLE } from "../routes/routes";

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
    }),
});

export const { useUploadSingleMutation, useUploadMultiMutation } = carApi;