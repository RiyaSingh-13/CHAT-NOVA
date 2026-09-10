export function formatMessageTime(date) {
  if (!date) return "";
  try {
    const messageDate = new Date(date);
    if (isNaN(messageDate.getTime())) return "";

    return messageDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return "";
  }
}

export function formatConversationTime(date) {
  if (!date) return "";
  try {
    const msgDate = new Date(date);
    if (isNaN(msgDate.getTime())) return "";

    const now = new Date();
    const isToday = msgDate.toDateString() === now.toDateString();

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = msgDate.toDateString() === yesterday.toDateString();

    if (isToday) {
      return msgDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    }

    if (isYesterday) {
      return "Yesterday";
    }

    return msgDate.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}
