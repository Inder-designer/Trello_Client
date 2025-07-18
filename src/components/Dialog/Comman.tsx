import Swal from "sweetalert2";

export const showSuccessAlert = (title: string, text?: string) => {
    Swal.fire({
        icon: "success",
        title,
        text,
        confirmButtonColor: "#0F172A",
    });
};

export const showErrorAlert = (title: string, text?: string) => {
    Swal.fire({
        icon: "error",
        title,
        text,
        confirmButtonColor: "#B91C1C",
    });
};

/**
 * Show a toast alert (success/info/warning/error)
 */
export const showToast = (
    title: string,
    icon: "success" | "info" | "warning" | "error" = "success"
) => {
    Swal.fire({
        toast: true,
        position: "top-end",
        icon,
        title,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
    });
};

/**
 * Show a Loading
 */
export const showLoadingDialog = (title: string = "Loading...") => {
    Swal.fire({
        title,
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading();
        },
    });
};

/**
 * Confirm dialog with yes/no
 */
export const showConfirmDialog = async (
    title: string,
    text?: string,
    options?: {
        icon?: "warning" | "info" | "question" | "error" | "success";
        confirmButtonText?: string;
        cancelButtonText?: string;
    }

): Promise<boolean> => {
    const result = await Swal.fire({
        title,
        text,
        icon: options?.icon || "warning",
        showCancelButton: true,
        confirmButtonColor: "#0F172A",
        cancelButtonColor: "#d33",
        confirmButtonText: options?.confirmButtonText || "Yes",
        cancelButtonText: options?.cancelButtonText || "Cancel",
    });

    return result.isConfirmed;
};
