import { ApiResponse } from "@/Types/ApiResponse";
import { baseApi } from "../baseApi";
import { PARTNER_REGISTER, USER_CHANGE_PASSWORD, USER_GET, USER_UPDATE } from "../routes/routes";

export const userApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getMe: builder.query({
            query: () => USER_GET,
            transformResponse: (response: ApiResponse) => response.data,
            providesTags: ['USER'],
        }),
        updateProfile: builder.mutation({
            query: (body) => ({
                url: USER_UPDATE,
                method: "PATCH",
                body: body
            }),
            invalidatesTags: ['USER']
        }),
        changePassword: builder.mutation({
            query: (body) => ({
                url: USER_CHANGE_PASSWORD,
                method: "PATCH",
                body: body
            }),
        }),
        registerPartner: builder.mutation({
            query: (body) => {
                console.log(body);
                return {
                    url: PARTNER_REGISTER,
                    method: "POST",
                    body: body
                }
            }
        }),
    }),
});

export const { useGetMeQuery, useUpdateProfileMutation, useChangePasswordMutation, useRegisterPartnerMutation } = userApi;