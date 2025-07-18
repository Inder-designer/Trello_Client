import { useEffect } from "react";
import { socket } from "../utils/socket";
import { useDispatch, useSelector } from "react-redux";
import { log } from "console";
import { updateJoinRequest } from "@/redux/Slices/boardSlice";
import { toast } from "sonner";

const useSocket = () => {
    const dispatch = useDispatch();
    const user = useSelector((state: any) => state.auth.user);
    useEffect(() => {
        if (user?._id) {
            socket.emit("joinRoom", user._id); // Join personal room
        }
        console.log("Socket connected:", socket.connected);

        socket.on("joinRequest", async (data) => {
            await dispatch(updateJoinRequest({ data }))
            toast.success("New Join request received");
            // Show notification (custom toast, modal, or UI update)
        });
        console.log("Socket event listeners set up for joinRequest");

        return () => {
            socket.off("joinRequest");
        };
    }, [user]);
};

export default useSocket;
