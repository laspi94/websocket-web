import type { ReactNode } from "react";

export type AuthContextType = {
    isLoggedIn: boolean,
    token: string | null;
    login: (email: string, password: string) => Promise<boolean>;
    session: () => boolean;
    logout: () => void;
}
export type AuthProviderProps = {
    children: ReactNode;
}