import axios from "axios";
import { Message, User } from "../types/types";
import { getUserAvatar } from "./getUserAvatar";

interface RawMessage {
    id: string;
    message: string;
    created_time: string;
    from: {
        id: string;
        name?: string;
    };
}

export async function getMessage(
    conversationId: string,
    pageAccessToken: string,
    limit: number
): Promise<Message[]> {
    try {
        const msgRes = await axios.get(
            `${process.env.FB_API_URL}/${conversationId}/messages`,
            {
                params: {
                    access_token: pageAccessToken,
                    fields: "message,created_time,from",
                    limit,
                },
            }
        );

        const messagesData: RawMessage[] = msgRes.data.data;

        if (!messagesData || messagesData.length === 0) return [] as Message[];
        const filteredMessages = messagesData.filter(msg => msg.message && msg.from);
        const sortedMessages = filteredMessages.sort(
            (a, b) => new Date(b.created_time).getTime() - new Date(a.created_time).getTime()
        );
        const messages: Message[] = await Promise.all(
            sortedMessages.map(async (msg) => {
                const sender: User = {
                    id: msg.from.id,
                    name: msg.from.name || "Unknown",
                    avatarUrl: await getUserAvatar(msg.from.id, pageAccessToken) || "",
                };

                return {
                    id: msg.id,
                    sender,
                    text: msg.message || "",
                    timestamp: msg.created_time,
                    read: false,
                };
            })
        );

        return messages;
    } catch (error) {
        console.error("Error fetching messages:", error);
        return [] as Message[];
    }
}
