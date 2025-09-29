// src/routes.tsx
import React, { type ReactNode } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "./pages/login";
import { useAuth } from "./providers";
import Dashboard from "./pages/dashboard";
import AppWrapper from "./App";

const PrivateRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { isLoggedIn } = useAuth();
    return isLoggedIn ? children : <Navigate to="/login" replace />;
};

const LoginWrapper: React.FC = () => {
    const { login, isLoggedIn } = useAuth();
    if (isLoggedIn) return <Navigate to="/" replace />;
    return <Login onLogin={login} />;
};

export const router = createBrowserRouter([
    {
        path: "/login",
        element:
            <AppWrapper>
                <LoginWrapper />
            </AppWrapper>,
    },
    {
        path: "/",
        element: (
            <PrivateRoute>
                <Dashboard />
            </PrivateRoute>
        ),
    },
]);
