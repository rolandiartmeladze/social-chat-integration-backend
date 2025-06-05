
import axios from "axios";
import { Message, User } from "../types/types";
import { getUserAvatar } from "./getUserAvatar";

export async function getLastMessage(
    conversationId: string,
    pageAccessToken: string
): Promise<Message | null> {
    try {
        const msgRes = await axios.get(
            `${process.env.FB_API_URL}/${conversationId}/messages`,
            {
                params: {
                    access_token: pageAccessToken,
                    fields: "message,created_time,from",
                    limit: 1,
                },
            }
        );

        if (msgRes.data.data.length === 0) return null;

        const msgData = msgRes.data.data[0];
        const senderRaw = msgData.from;

        const sender: User = {
            id: senderRaw.id,
            name: senderRaw.name || "Unknown",
            avatarUrl: await getUserAvatar(senderRaw.id, pageAccessToken) || "",
        };

        const lastMessage: Message = {
            id: msgData.id,
            sender,
            text: msgData.message || "",
            timestamp: msgData.created_time,
            read: false,
        };

        return lastMessage;
    } catch (error) {
        console.warn(`Couldn't fetch last message for conversation ${conversationId}`, error);
        return null;
    }
}