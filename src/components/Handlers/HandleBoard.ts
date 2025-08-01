import { useToggleBoardCloseMutation, useLeaveBoardMutation } from "@/redux/api/Board";
import { showConfirmDialog, showLoadingDialog } from "../Dialog/Comman";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const HandleBoard = () => {
    const navigate = useNavigate();
    const [leaveBoard] = useLeaveBoardMutation();
    const [closeBoard] = useToggleBoardCloseMutation();

    const handleLeaveBoard = async (boardId: string) => {
        if (!boardId) return;
        const confirmed = await showConfirmDialog(
            "Are you sure you want to leave this board?",
            "You will lose access to all cards in this board.",
            {
                confirmButtonText: "Leave",
                cancelButtonText: "Cancel",
                icon: "warning"
            }
        );
        if (!confirmed) return;
        showLoadingDialog("Leaving...");
        try {
            await leaveBoard(boardId).unwrap();
            Swal.close();
            toast.success('Successfully left the board');
            navigate('/boards');
        } catch (error) {
            const errorMessage = (error as { data?: { message?: string } })?.data?.message || 'Failed to leave board';
            toast.error(errorMessage);
        }
    };
    const handleToggleBoardClose = async (boardId: string, isClosed: boolean) => {
        if (!boardId) return;
        const confirmed = await showConfirmDialog(
            `Are you sure you want to ${isClosed ? "reopen" : "close"} this board?`,
            "",
            {
                confirmButtonText: isClosed ? "Reopen" : "Close",
                cancelButtonText: "Cancel",
                icon: "warning"
            }
        );
        if (!confirmed) return;
        showLoadingDialog(isClosed ? "Reopening..." : "Closing...");
        try {
            await closeBoard(boardId).unwrap();
            Swal.close();
            toast.success(`Board ${isClosed ? "reopened" : "closed"} successfully`);
        } catch (error) {
            const errorMessage = (error as { data?: { message?: string } })?.data?.message || `Failed to ${isClosed ? "reopen" : "close"} board`;
            toast.error(errorMessage);
        }
    };
    // Handle board settings (placeholder for future implementation)
    const handleBoardSettings = () => {
        toast.info('Board settings feature coming soon!');
    };

    // Handle archive board (placeholder for future implementation)
    const handleArchiveBoard = () => {
        toast.info('Archive board feature coming soon!');
    };

    return { handleLeaveBoard, handleBoardSettings, handleArchiveBoard, handleToggleBoardClose }
}