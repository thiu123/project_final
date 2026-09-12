import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { io, type Socket } from "socket.io-client";
import type { NewOrderPayload, OrderNotification } from "@/types";

const MAX_ITEMS = 20;

export const useNotificationStore = defineStore("notification", () => {
  const items = ref<OrderNotification[]>([]);
  const connected = ref(false);
  const latest = ref<OrderNotification | null>(null);

  let socket: Socket | null = null;

  const unreadCount = computed(
    () => items.value.filter((item) => !item.read).length
  );

  function connect(token: string) {
    if (socket || !token || !import.meta.client) return;

    const { apiBase } = useRuntimeConfig().public;

    socket = io(`${apiBase}/notifications`, {
      auth: { token: `Bearer ${token}` },
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      connected.value = true;
    });

    socket.on("disconnect", () => {
      connected.value = false;
    });

    socket.on("order:new", (payload: NewOrderPayload) => {
      const notification: OrderNotification = {
        ...payload,
        id: `${payload.orderId}-${payload.createdAt}`,
        read: false,
      };

      if (items.value.some((item) => item.id === notification.id)) return;

      items.value = [notification, ...items.value].slice(0, MAX_ITEMS);
      latest.value = notification;
    });
  }

  function disconnect() {
    socket?.disconnect();
    socket = null;
    connected.value = false;
  }

  function markAllRead() {
    items.value = items.value.map((item) => ({ ...item, read: true }));
  }

  function clear() {
    items.value = [];
    latest.value = null;
  }

  return {
    items,
    latest,
    connected,
    unreadCount,
    connect,
    disconnect,
    markAllRead,
    clear,
  };
});
