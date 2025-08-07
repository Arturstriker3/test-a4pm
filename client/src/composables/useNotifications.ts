import { ref } from "vue";

interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
}

const notifications = ref<Notification[]>([]);

export function useNotifications() {
  const add = (notification: Omit<Notification, "id">) => {
    const id = Date.now().toString();
    const newNotification: Notification = {
      id,
      duration: 5000,
      ...notification,
    };

    notifications.value.push(newNotification);

    // Auto remove após duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        remove(id);
      }, newNotification.duration);
    }

    return id;
  };

  const remove = (id: string) => {
    const index = notifications.value.findIndex((n) => n.id === id);
    if (index > -1) {
      notifications.value.splice(index, 1);
    }
  };

  const clear = () => {
    notifications.value = [];
  };

  // Helper methods
  const success = (title: string, message?: string, duration?: number) => {
    return add({ type: "success", title, message, duration });
  };

  const error = (title: string, message?: string, duration?: number) => {
    return add({ type: "error", title, message, duration });
  };

  const warning = (title: string, message?: string, duration?: number) => {
    return add({ type: "warning", title, message, duration });
  };

  const info = (title: string, message?: string, duration?: number) => {
    return add({ type: "info", title, message, duration });
  };

  return {
    notifications,
    add,
    remove,
    clear,
    success,
    error,
    warning,
    info,
  };
}
