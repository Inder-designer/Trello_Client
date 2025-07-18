import { ApiResponse } from "../../Types/ApiResponse";
import { baseApi } from "../baseApi";
import { CAR_ADD, CAR_DETAILS, CAR_LIST, CAR_MY_LIST } from "../routes/routes";

export const carApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        addCar: builder.mutation({
            query: (data) => ({
                url: CAR_ADD,
                method: 'POST',
                body: data
            }),
            transformResponse: (response: ApiResponse) => response.data,
        }),
        getMyCarList: builder.query({
            query: ({ status }) => CAR_MY_LIST(status),
            transformResponse: (response: ApiResponse) => response.data,
        }),
        getCarDetails: builder.query({
            query: ({ id }) => CAR_DETAILS(id),
            transformResponse: (response: ApiResponse) => response.data,
        }),
        getCars: builder.query({
            query: (queries) => `/car/list?${queries}`,
            transformResponse: (response: ApiResponse) => response.data,
        }),
    }),
});

export const { useAddCarMutation, useGetMyCarListQuery, useGetCarDetailsQuery, useGetCarsQuery } = carApi;