import "../../public/css/dashboard.css";

import { Action, Event, Notify } from "../enums";
import { getChannels, getClientsByChannel, getEvents, broadcast } from "../services";
import { useAuth } from "../providers";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../providers/NotificationProvider";
import React, { useEffect, useRef, useState } from "react";
import type { Message } from "../types/message";
import useWebSocket, { ReadyState } from "react-use-websocket";
import type { WebSocketLike } from "react-use-websocket/dist/lib/types";

const ID_CLIENT = 'dashboard-ws';

const Dashboard: React.FC = () => {
    const [channels, setChannels] = useState<string[]>([]);
    const [clients, setClients] = useState<string[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState<string>("");
    const [selectedChannel, setSelectedChannel] = useState<string>("");
    const { logout } = useAuth();
    const { notify } = useNotification();
    const wsRef = useRef<WebSocketLike | null>(null);
    const { sendJsonMessage, lastMessage, readyState, getWebSocket } = useWebSocket(import.meta.env.VITE_URL_WEBSOCKET || "ws://localhost:8080");

    const navigate = useNavigate();

    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    const fetchChannels = async () => {
        try {
            const res: { channels: string[] } = await getChannels();

            /** Solo asigna si hay canales nuevos */
            setChannels(prevChannels => {
                if (prevChannels.length !== res.channels.length) {
                    return res.channels;
                }

                /** verifica que no haya modificación por item, puede no cambiar la cantidad pero si el valor del canal */
                const isSame = prevChannels.every((c, i) => c === res.channels[i]);
                if (!isSame) {
                    return res.channels;
                }

                return prevChannels;
            });

            if (!selectedChannel && res.channels.length > 0) {
                setSelectedChannel(res.channels[0]);
            }

            if (selectedChannel && !res.channels.includes(selectedChannel)) {
                setSelectedChannel(res.channels[0] || "");
            }
        } catch (err) {
            notify("❌ Error cargando canales:", Notify.ERROR);
        }
    };

    const fetchClients = async () => {
        try {
            const clientsRes: { clients: string[] } = await getClientsByChannel(selectedChannel);
            setClients(clientsRes.clients);

            const data = await getEvents(selectedChannel);
            const formatted = data.map((msg: any, index: number) => ({
                id: `${msg.Timestamp}-${index}`,
                Sender: msg.Sender,
                Message: msg.Message,
                Timestamp: msg.Timestamp,
            }));
            setMessages(formatted);
        } catch (error) {
            console.error("Error cargando clientes del canal:", error);
        }
    };

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    useEffect(() => {
        wsRef.current = getWebSocket();

        return () => {
            wsRef.current?.close();
        }
    }, [])

    useEffect(() => {
        let keepAlive: ReturnType<typeof setTimeout> | null = null;

        if (readyState === ReadyState.OPEN) {
            notify("🟢 WebSocket conectado", Notify.INFO);

            sendJsonMessage({
                Action: 'auth',
                Token: import.meta.env.VITE_TOKEN_WEBSOCKET ?? 'server',
                Id: ID_CLIENT
            });

            keepAlive = setInterval(() => {
                sendJsonMessage({
                    Action: 'ping'
                })
            }, 25000);
        } else if (readyState === ReadyState.CONNECTING) {
            notify("⏳ Conectando...", Notify.INFO);
        } else if (readyState === ReadyState.CLOSED) {
            notify("🔴 Conexión cerrada", Notify.ERROR);
        }

        return () => {
            if (keepAlive) clearInterval(keepAlive)
        }

    }, [readyState]);

    useEffect(() => {
        if (!lastMessage?.data) return;
        const event = JSON.parse(lastMessage?.data);

        if (event.Event === Event.SUCCESS) {
            fetchClients();
            notify(`✅ ${event.Message}`, Notify.SUCCESS);
        }

        if (event.Event === Event.ERROR) {
            notify(`❌ ${event.Message}`, Notify.ERROR);
        }

        if (event.Event == Event.EVENT) {
            notify("📩 Nuevo evento recibido", Notify.INFO);

            const now = new Date();
            const timestamp = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}.${now.getMilliseconds()}`;

            const newMessage = {
                id: `${timestamp}-${event.Sender}`,
                Sender: event.Sender ?? 'anonymous',
                Message: event.Message,
                Timestamp: timestamp,
            };

            setMessages(prev => [...prev, newMessage]);
        }

        if (event.Event == Event.SUBSCRIBED) {
            notify("🟢 Nuevo cliente conectado", Notify.INFO);
            fetchClients();
        }

        if (event.Event == Event.DISCONNECTED) {
            notify("🔴 Cliente desconectado", Notify.INFO);
            fetchClients();
        }
    }, [lastMessage]);

    useEffect(() => {
        if (!selectedChannel) return;

        const handler = setTimeout(() => {
            sendJsonMessage({
                Action: Action.SUBSCRIBE,
                Channel: selectedChannel
            });
        }, 1000);

        return () => {
            clearTimeout(handler);
        };
    }, [selectedChannel]);

    useEffect(() => {
        fetchChannels();

        const interval = setInterval(fetchChannels, 15000);
        return () => clearInterval(interval);
    }, [selectedChannel]);

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        try {
            await broadcast(selectedChannel, newMessage, ID_CLIENT, ID_CLIENT);
            setNewMessage("");
        } catch (error) {
            notify("❌ Error emitiendo el mensaje:", Notify.ERROR);
        }
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Dashboard</h1>
                <button className="cta-button" onClick={handleLogout}>
                    <span>Logout</span>
                </button>
            </header>

            <main className="dashboard-main">
                {/* Stats */}
                <section className="stats">
                    <div className="stat-box">
                        <div className="stat-number">{clients.length}</div>
                        <div className="stat-text">Clientes conectados</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-number">{messages.length}</div>
                        <div className="stat-text">Mensajes totales</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-number">{channels.length}</div>
                        <div className="stat-text">Canales activos</div>
                    </div>
                </section>

                {/* Selección de canal */}
                <section className="channel-selector">
                    <label htmlFor="channel-select">Selecciona un canal:</label>
                    <select
                        id="channel-select"
                        value={selectedChannel}
                        onChange={(e) => setSelectedChannel(e.target.value)}
                    >
                        {channels.map(ch => (
                            <option key={ch} value={ch}>{ch}</option>
                        ))}
                    </select>
                </section>

                <div className="dashboard-grids">
                    {/* Área de eventos */}
                    <section className="event-wrapper">
                        <h2>Eventos - {selectedChannel}</h2>
                        <div className="event-area">
                            <div className="event-messages">
                                {messages.map(msg => (
                                    <div key={msg.id} className="event-message">
                                        <span className="event-user">{msg.Sender}</span>: {msg.Message}{" "}
                                        <span className="event-time">{msg.Timestamp}</span>
                                    </div>
                                ))}

                                {/* Elemento vacío para hacer scroll */}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>
                    </section>

                    {/* Área de clientes */}
                    <section className="clients-wrapper">
                        <h2>Clientes conectados</h2>
                        <div className="clients-area">
                            <ul className="client-list">
                                {clients.map((client, idx) => (
                                    <li key={idx}>{client}</li>
                                ))}
                            </ul>
                        </div>
                    </section>
                </div>

                {/* Broadcast fuera del chat */}
                <section className="broadcast-area">
                    <div className="broadcast-input">
                        <input
                            type="text"
                            placeholder="Escribe un mensaje..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                        />
                        <button className="cta-button" onClick={handleSendMessage}>
                            <span>Enviar</span>
                        </button>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Dashboard;
