"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Conversation,
  Message,
  ensureChat,
  getChatId,
  sendMessage as sendMessageService,
  subscribeConversations,
  subscribeMessages,
} from "@/lib/chat/service";

export function useChat(
  currentUserId: string | undefined,
  otherUserId?: string
) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const unsubConv = useRef<(() => void) | undefined>(undefined);
  const unsubMsg = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    if (!currentUserId) return;
    unsubConv.current?.();
    unsubConv.current = subscribeConversations(currentUserId, setConversations);
    return () => unsubConv.current?.();
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId || !otherUserId) return;
    setLoading(true);
    ensureChat(currentUserId, otherUserId)
      .then((chatId) => {
        unsubMsg.current?.();
        unsubMsg.current = subscribeMessages(chatId, (items) => {
          setMessages(items);
          setLoading(false);
        });
      })
      .catch(() => setLoading(false));
    return () => unsubMsg.current?.();
  }, [currentUserId, otherUserId]);

  const chatId = useMemo(() => {
    if (!currentUserId || !otherUserId) return undefined;
    return getChatId(currentUserId, otherUserId);
  }, [currentUserId, otherUserId]);

  const sendMessage = async (text: string) => {
    if (!chatId || !currentUserId) return;
    await sendMessageService(chatId, currentUserId, text);
  };

  return { conversations, messages, loading, sendMessage };
}
