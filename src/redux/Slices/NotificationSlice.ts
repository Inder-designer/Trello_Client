import { createSlice } from "@reduxjs/toolkit";
import { read } from "fs";

const initialState = {
    notifications: []
};

const notificationSlice = createSlice({
    name: "notification",
    initialState,
    reducers: {
        setNotifications(state, action) {
            state.notifications = action.payload;
        },
        addNotification(state, action) {
            state.notifications.unshift(action.payload);
        },
        removeNotification(state, action) {
            state.notifications = state.notifications.filter(
                (notification) => notification.id !== action.payload.id
            );
        },
        readNotification(state, action) {
            const { id, read } = action.payload;
            console.log("Reading notification:", id, "Read status:", read);
            
            const notification = state.notifications.find(
                (notification) => notification._id === id
            );
            if (notification) {
                notification.read = read;
            }
        }
    }
});

export const { setNotifications, addNotification, removeNotification, readNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
