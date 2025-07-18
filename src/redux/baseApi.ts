import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { FORGOT_PASSWORD, LOGIN, LOGOUT, OTP_VERIFY, REGISTER, RESET_PASSWORD } from './routes/routes';
import { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { BaseQueryApi } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_LIVE_API_URL,
    credentials: 'include',
    prepareHeaders: (headers) => headers,
});

type ExtraOptions = object;

const baseQueryWithAuth: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError,
    ExtraOptions
> = async (
    args: string | FetchArgs,
    api: BaseQueryApi,
    extraOptions: ExtraOptions
) => {
        const result = await baseQuery(args, api, extraOptions);

        if (result.error && result.error.status === 401) {
            console.error("Token expired. Redirecting to login.");
        }

        return result;
    };

// Define a service using a base URL and expected endpoints
export const baseApi = createApi({
    reducerPath: 'baseApi',
    baseQuery: baseQueryWithAuth,
    tagTypes: ['Auth', 'USER', "CAR", "BOARDS", "BOARD","Card"],
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (data) => ({
                url: LOGIN,
                method: 'POST',
                body: data
            }),
        }),
        register: builder.mutation({
            query: (data) => ({
                url: REGISTER,
                method: 'POST',
                body: data
            })
        }),
        forgotPassword: builder.mutation({
            query: (data) => ({
                url: FORGOT_PASSWORD,
                method: 'POST',
                body: data
            })
        }),
        otpVerify: builder.mutation({
            query: (data) => ({
                url: OTP_VERIFY,
                method: 'POST',
                body: data
            })
        }),
        resetPasword: builder.mutation({
            query: (data) => ({
                url: RESET_PASSWORD,
                method: 'POST',
                body: data
            })
        }),
        logout: builder.mutation({
            query: () => ({
                url: LOGOUT,
                method: 'POST',
            }),
        })
    })
})

export const { useLoginMutation, useLogoutMutation, useRegisterMutation, useForgotPasswordMutation, useOtpVerifyMutation, useResetPaswordMutation } = baseApi;