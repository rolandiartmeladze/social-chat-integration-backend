import { Conversation, IConversation, IParticipant, IMessage } from "../models/Conversation";

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

    const existingConversation = await Conversation.findOne({ customId });

    if (existingConversation) {
        const updated = await insertMessageInConversation(existingConversation, sender, text, timestamp);
        return updated;
    } else {
        const newConv = await createConversation({ customId, platform, sender, text, timestamp });
        return newConv;
    }
}

async function insertMessageInConversation(
    conversation: IConversation,
    sender: IParticipant,
    text: string,
    timestamp: Date
): Promise<IConversation> {
    const message: IMessage = {
        senderId: sender.id,
        text,
        timestamp,
        read: false,
    };

    conversation.messages.push(message);
    conversation.lastUpdated = timestamp;
    conversation.unreadCount += 1;

    const existing = conversation.participants.find(p => p.id === sender.id);
    if (!existing) {
        conversation.participants.push(sender);
    }

    await conversation.save();
    return conversation;
}

async function createConversation({
    customId,
    platform,
    sender,
    text,
    timestamp,
}: UpdateConversationParams): Promise<IConversation> {
    const message: IMessage = {
        senderId: sender.id,
        text,
        timestamp,
        read: false,
    };

    const newConv = new Conversation({
        customId,
        platform,
        participants: [sender],
        messages: [message],
        lastUpdated: timestamp,
        unreadCount: 1,
        status: "open",
    });

    await newConv.save();
    return newConv;
}
