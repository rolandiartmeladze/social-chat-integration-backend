import { Conversation, IConversation, IParticipant } from "../models/Conversation";
import { Message } from "../models/Message";
import { io } from "../socket";

interface UpdateConversationParams {
    customId: string;
    platform: string;
    sender: IParticipant;
    text: string;
    timestamp: Date;
    participants?: IParticipant[];
}

export async function updateConversation({
    customId,
    platform,
    sender,
    text,
    timestamp,
    participants,
}: UpdateConversationParams): Promise<IConversation> {
    let conversation = await Conversation.findOne({ customId });

    if (!conversation) {
        conversation = await Conversation.create({
            customId,
            platform,
            participants: participants || [sender],
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

    conversation.lastMessage = messageDoc._id;
    conversation.lastUpdated = timestamp;
    conversation.unreadCount += 1;

    await conversation.save();

    io.emit("conversationUpdated", {
        customId: conversation._id,
        platform,
        text,
        timestamp,
        sender,
    });

    return conversation;
}
