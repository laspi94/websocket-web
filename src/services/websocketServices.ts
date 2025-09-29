import { apiFetch } from "./api";

export async function getChannels() {
    return apiFetch("/channels", 'GET');
}

export async function getEvents(channel: string) {
    return apiFetch(`/channel/events?channel=${channel}`, 'GET');
}

export async function getClients() {
    return apiFetch("/clients", 'GET');
}

export async function getClientsByChannel(channel: string) {
    return apiFetch(`/clients/by-channel?channel=${channel}`, 'GET');
}

export async function broadcast(channel: string, message: string) {
    return apiFetch(`/broadcast?channel=${channel}&message=${message}`, 'POST');
}