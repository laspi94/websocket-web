import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { AuthContextType } from "../types";
import { login as loginService } from "./../services/authServices";
import { parseJwt } from "../utils";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) throw new Error("useAuth must be used within AuthProvider");

    return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem("_wstoken"));
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const data = await loginService(email, password);

            if (!data.success) {
                return false;
            }

            localStorage.setItem("_wstoken", data.token);
            setToken(data.token);
            setIsLoggedIn(true);
            return true;
        } catch (error) {
            return false;
        }
    };

    const session = (): boolean => {
        const decoded = token ? parseJwt(token) : null;

        if (!decoded || !decoded.exp) {
            return false;
        }

        return decoded.exp * 1000 > Date.now();
    };

    const logout = () => {
        localStorage.removeItem("_wstoken");
        setToken(null);
        setIsLoggedIn(false);
    };

    useEffect(() => {
        if (token) {
            setIsLoggedIn(true);
        }

        const handler = () => {
            logout();
        };

        window.addEventListener("unauthorized", handler);
        return () => window.removeEventListener("unauthorized", handler);
    }, [])


    return (
        <AuthContext.Provider value={{ isLoggedIn, token, login, session, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
