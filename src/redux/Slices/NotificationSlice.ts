import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    notificationData: {
        notifications: [],
        pagination: {}
    }
};

const notificationSlice = createSlice({
    name: "notification",
    initialState,
    reducers: {
        setNotifications(state, action) {
            state.notificationData = action.payload;
        },
        appendNotifications(state, action) {
            const existingIds = new Set(state.notificationData.notifications.map(n => n._id));
            const newOnes = action.payload.notifications.filter(n => !existingIds.has(n._id));

            state.notificationData = {
                ...state.notificationData,
                notifications: [...state.notificationData.notifications, ...newOnes],
                pagination: action.payload.pagination
            };
        },
        addNotification(state, action) {
            state.notificationData.notifications.unshift(action.payload);
        },
        removeNotification(state, action) {
            state.notificationData.notifications = state.notificationData.notifications.filter(
                (notification) => notification.id !== action.payload.id
            );
        },
        readNotification(state, action) {
            const { id, read } = action.payload;
            console.log("Reading notification:", id, "Read status:", read);

            const notification = state.notificationData.notifications.find(
                (notification) => notification._id === id
            );
            if (notification) {
                notification.read = read;
            }
        }
    }
});

export const { setNotifications, addNotification, removeNotification, readNotification, appendNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
