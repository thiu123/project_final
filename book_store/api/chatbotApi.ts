import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import type { ChatReply } from "@/types";

const BASE_URL = API_ENDPOINTS.CHATBOT;

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Sends one conversational turn. The backend keeps the thread per user, so the
 * client only ever posts the new message.
 */
export const sendChatMessage = async (message: string): Promise<ChatReply> => {
  try {
    const response = await axiosInstance.post<ApiEnvelope<ChatReply>>(
      `${BASE_URL}/chat`,
      { message },
    );
    return response.data.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

/** Drops the stored conversation so the next message starts a new thread. */
export const clearChatHistory = async (): Promise<void> => {
  try {
    await axiosInstance.delete(`${BASE_URL}/history`);
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

// `POST /suggestions` and `POST /review/generate` still exist on the backend,
// but the widget now routes everything through /chat — the model decides
// whether a message wants recommendations or a review. No wrapper is kept here
// until something actually calls them.
