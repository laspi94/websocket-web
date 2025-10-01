import React, { useEffect, useState } from "react";
import type { Notify as NotifyType } from "../enums";
import { Notify } from "../enums";

interface NotificationProps {
    id: number;
    message: string;
    type?: NotifyType;
    onClose: (id: number) => void;
}

const Notification: React.FC<NotificationProps> = ({ id, message, type = Notify.INFO, onClose }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // animación de entrada
        setVisible(true);

        // autodestruir después de 5s
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(() => onClose(id), 300); // esperar animación de salida
        }, 5000);

        return () => clearTimeout(timer);
    }, [id, onClose]);

    const icon =
        type === "success"
            ? "check-circle"
            : type === "error"
                ? "times-circle"
                : type === "warning"
                    ? "exclamation-circle"
                    : "info-circle";

    return (
        <div className={`notification notification-${type} ${visible ? "show" : "hide"}`}>
            <i className={`fas fa-${icon}`} />
            <span>{message}</span>
        </div>
    );
};

export default Notification;
