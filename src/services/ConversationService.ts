import { Conversation, IConversation, IParticipant } from "../models/Conversation";
import { Message, IMessage } from "../models/Message";
import { Types, Document } from "mongoose";

interface UpdateConversationParams {
    customId: string;
    platform: string;
    sender: IParticipant;
    text: string;
    timestamp: Date;
}

export async function updateConversation({
    customId,
    platform,
    sender,
    text,
    timestamp,
}: UpdateConversationParams): Promise<IConversation> {
    let conversation = await Conversation.findOne({ customId });

    if (!conversation) {
        conversation = await Conversation.create({
            customId,
            platform,
            participants: [sender],
            lastUpdated: timestamp,
            unreadCount: 1,
            status: "open",
        });
    }

    if (!conversation.participants.some(p => p.id === sender.id)) {
        conversation.participants.push(sender);
    }

    const messageDoc = await Message.create({
        conversationId: conversation._id,
        sender,
        text,
        timestamp,
        read: false,
    });

    conversation.lastMessage = messageDoc._id as Types.ObjectId;
    conversation.lastUpdated = timestamp;
    conversation.unreadCount += 1;

    await conversation.save();
    return conversation;
}
