import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../providers";
import { useNavigate } from "react-router-dom";
import { getChannels, getClientsByChannel, getEvents, broadcast } from "../services";
import "../../public/css/dashboard.css";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { useNotification } from "../providers/NotificationProvider";

interface Message {
    id: string;
    Sender: string;
    Message: string;
    Timestamp: string;
}

const Dashboard: React.FC = () => {

    const { notify } = useNotification();

    const { sendJsonMessage, lastMessage, readyState } = useWebSocket(import.meta.env.VITE_URL_WEBSOCKET || "ws://localhost:8080");

    const { logout } = useAuth();
    const navigate = useNavigate();

    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const [channels, setChannels] = useState<string[]>([]);
    const [selectedChannel, setSelectedChannel] = useState<string>("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [clients, setClients] = useState<string[]>([]);
    const [newMessage, setNewMessage] = useState<string>("");

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    useEffect(() => {
        let keepAlive: ReturnType<typeof setTimeout> | null = null;

        if (readyState === ReadyState.OPEN) {

            notify("🟢 WebSocket conectado", "info");
            sendJsonMessage({
                Action: 'auth',
                Token: import.meta.env.VITE_TOKEN_WEBSOCKET ?? 'server',
                Id: 'dashboard-ws'
            });

            keepAlive = setInterval(() => {
                sendJsonMessage({
                    Action: 'ping'
                })
            }, 25000);
        } else if (readyState === ReadyState.CONNECTING) {
            notify("⏳ Conectando...", "info");
        } else if (readyState === ReadyState.CLOSED) {
            notify("🔴 Conexión cerrada", "error");
        }

        return () => {
            if (keepAlive) clearInterval(keepAlive)
        }

    }, [readyState]);

    useEffect(() => {
        if (!lastMessage?.data) return;
        const event = JSON.parse(lastMessage?.data);

        if (event.Event === 'success') {
            notify(`✅ ${event.Message}`, "success");
        }

        if (event.Event === 'error') {
            notify(`❌ ${event.Message}`, "error");
        }

        if (event.Event == 'event') {
            notify("📩 Nuevo evento recibido", "info");

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

        if (event.Event == 'subscribed') {
            notify("👤 Nuevo cliente conectado", "info");
        }
    }, [lastMessage]);

    useEffect(() => {
        if (!selectedChannel) return;

        sendJsonMessage({
            Action: 'subscribe',
            Channel: selectedChannel
        });

    }, [selectedChannel]);

    useEffect(() => {
        const fetchChannels = async () => {
            try {
                const res: { channels: string[] } = await getChannels();
                setChannels(res.channels);

                if (!selectedChannel && res.channels.length > 0) {
                    setSelectedChannel(res.channels[0]);
                }

                if (selectedChannel && !res.channels.includes(selectedChannel)) {
                    setSelectedChannel(res.channels[0] || "");
                }
            } catch (err) {
                notify("❌ Error cargando canales:", "error");
                console.error("Error cargando canales:", err);
            }
        };

        fetchChannels();

        const interval = setInterval(fetchChannels, 10000);
        return () => clearInterval(interval);
    }, [selectedChannel]);

    useEffect(() => {
        if (!selectedChannel) return;

        const fetchData = async () => {
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
                console.error("Error cargando datos del canal:", error);
            }
        };

        fetchData();
    }, [selectedChannel]);

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        try {
            await broadcast(selectedChannel, newMessage);
            setNewMessage("");
        } catch (error) {
            console.error("Error enviando mensaje:", error);
            alert("Error enviando mensaje.");
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
