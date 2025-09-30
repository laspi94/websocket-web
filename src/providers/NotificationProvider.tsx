import React, { createContext, useCallback, useContext, useState } from "react";
import Notification from "../components/notification";
import type { Noti } from "../types";

interface NotificationContextType {
    notify: (message: string, type?: Noti["type"]) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

let idCounter = 0;

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Noti[]>([]);

    const notify = useCallback((message: string, type: Noti["type"] = "info") => {
        const id = ++idCounter;
        setNotifications(prev => [...prev, { id, message, type }]);
    }, []);

    const removeNotification = (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return (
        <NotificationContext.Provider value={{ notify }}>
            {children}

            {/* Contenedor de notificaciones */}
            <div className="notification-container">
                {notifications.map(n => (
                    <Notification key={n.id} {...n} onClose={removeNotification} />
                ))}
            </div>
        </NotificationContext.Provider>
    );
};

export const useNotification = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotification debe usarse dentro de NotificationProvider");
    }
    return context;
};
