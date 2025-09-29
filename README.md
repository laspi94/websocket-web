# 📊 Dashboard de Canales y Mensajes

Este módulo implementa un **Dashboard en React** que permite:

- Listar **canales activos** y actualizar automáticamente cada 10 segundos.
- Consultar **clientes conectados** a un canal.
- Visualizar el **historial de mensajes** de cada canal, actualizado cada 3 segundos.
- Enviar mensajes mediante **broadcast** a un canal seleccionado.
- Control de sesión con **AuthProvider** (`logout`, `login`).
- Navegación protegida con **Rutas privadas** (`PrivateRoute`).

---

## 🚀 Estructura del componente

### Archivos principales

- `src/pages/dashboard.tsx` → Componente principal del Dashboard.
- `src/services/index.ts` → Servicios para consumir la API REST.
- `src/providers/index.ts` → Proveedor de autenticación.
- `public/css/dashboard.css` → Estilos del dashboard.

---

## ⚡ Funcionalidades

### 1. Autenticación y Logout
- El Dashboard solo se puede acceder si el usuario está logueado.
- Usa `useAuth` para acceder a:
  - `isLoggedIn`
  - `login`
  - `logout`
- Botón **Logout** redirige a `/login`.

---

### 2. Canales

- Se consultan desde la API con `getChannels()`.
- Se refrescan **cada 10 segundos** automáticamente.
- Si el canal actual desaparece, se selecciona el primer canal disponible.
- Selección manual mediante `<select>`.

```ts
const [channels, setChannels] = useState<string[]>([]);
const [selectedChannel, setSelectedChannel] = useState<string>("");
```

### 3. Clientes conectados

API: getClientsByChannel(channel).

Se actualizan junto con los mensajes cada 3 segundos.

Renderizados en una lista <ul>.

### 4. Mensajes

> API: getEvents(channel).

Se muestran en el área de chat.

- Cada mensaje tiene:
+ Sender
+ Message
+ Timestamp

Se refrescan cada 3 segundos.

### 5. Broadcast (Enviar mensaje)

> API: broadcast(channel, message).

Input de texto y botón para enviar mensajes al canal actual.

El mensaje se agrega localmente a la lista tras enviarse.

```ts
const handleSendMessage = async () => {
  await broadcast(selectedChannel, newMessage);
  setMessages(prev => [...prev, {
    id: `${Date.now()}`,
    Sender: "Yo",
    Message: newMessage,
    Timestamp: new Date().toLocaleTimeString(),
  }]);
};
```

## 📦 Servicios de API

Los servicios están centralizados en src/services/ usando apiFetch:
```ts
export async function getChannels() {
  return apiFetch("/channels", { method: "GET" });
}

export async function getClientsByChannel(channel: string) {
  return apiFetch(`/clients-by-channel?channel=${channel}`, { method: "GET" });
}

export async function getEvents(channel: string) {
  return apiFetch(`/channel/events?channel=${channel}`, { method: "GET" });
}

export async function broadcast(channel: string, message: string) {
  return apiFetch(`/broadcast?channel=${channel}&message=${message}`, { method: "POST" });
}
```

📌 Pendientes / Mejoras

Integración en tiempo real con WebSockets (ahora es polling).

Paginación de mensajes largos.

Notificaciones de nuevos mensajes.

Loader de carga inicial.