import React, { useEffect, useState } from "react";
import "../../public/css/login.css";
import type { LoginProps } from "../types";
import { useAuth } from "../providers";
import { useNavigate } from "react-router-dom";

const Login: React.FC<LoginProps> = () => {
    const navigate = useNavigate();

    const { isLoggedIn, login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await login(email, password);

        if (!success) {
            setErrorMessage("credenciales inválidas")
            setTimeout(() => setErrorMessage(""), 5000)
        } else {
            setErrorMessage("");
        }
    };

    useEffect(() => {
        if (isLoggedIn) {
            navigate("/", { replace: true });
        }
    }, [isLoggedIn])
    return (
        <div className="login-container">
            <div className="login-hero">
                <div className="login-content">
                    <h1>Login</h1>
                    <p>Ingrese sus credenciales para acceder al sistema</p>
                    <form onSubmit={handleSubmit} className="login-form">
                        <input
                            type="email"
                            placeholder="Correo electrónico"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button type="submit" className="cta-button">
                            <span>Ingresar</span>
                        </button>
                        {errorMessage && <p className="login-error">{errorMessage}</p>}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
