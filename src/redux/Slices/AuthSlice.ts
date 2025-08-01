import { IUser } from '@/Types/IUser';
import { createSlice } from '@reduxjs/toolkit';

interface initialStateType {
    user: IUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const initialState: initialStateType = {
    user: null,
    isAuthenticated: false,
    isLoading: true
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser(state, action) {
            state.user = action.payload;
            state.isAuthenticated = !!action.payload;
            state.isLoading = false
        },
        clearUser(state) {
            state.user = null;
            state.isAuthenticated = false;
            state.isLoading = false
        },
    }
});
export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;