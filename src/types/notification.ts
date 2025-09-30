
export type NotificationProps = {
    id: number;
    message: string;
    type?: "info" | "success" | "error" | "warning";
    onClose: (id: number) => void;
}

export type Noti = {
    id: number;
    message: string;
    type?: "info" | "success" | "error" | "warning";
}