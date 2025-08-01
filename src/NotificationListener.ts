import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { socket } from "./utils/socket";
import { IUser } from "./Types/IUser";
import { AppDispatch } from "./redux/store/store";
import { addNotification, setNotifications } from "./redux/Slices/NotificationSlice";
import { useNotificationsQuery } from "./redux/api/common";

const NotificationListener = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { data: notifications } = useNotificationsQuery({})
    const user = useSelector((state: { auth: { user: IUser | null } }) => state.auth.user);

    useEffect(() => {
        dispatch(setNotifications(notifications || []));
    }, [notifications]);

    useEffect(() => {
        if (user?._id) {
            socket.emit("joinUser", user._id);

            socket.on("notification:receive", (notification) => {
                console.log("📨 New Notification:", notification);
                dispatch(addNotification(notification));
            });

            return () => {
                socket.off("notification:receive");
            };
        }
    }, [user?._id]);

    return null;
};

export default NotificationListener;
