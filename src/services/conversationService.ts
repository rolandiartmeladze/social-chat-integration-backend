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

/**
 * 🧠 ფუნქცია, რომელიც ამატებს ან ანახლებს ჩატს შეტყობინების მიღებისას
 */
export async function updateConversation({
    customId,
    platform,
    sender,
    text,
    timestamp,
    participants,
}: UpdateConversationParams): Promise<IConversation> {
    // 🔍 მოძებნე ჩატი მისი customId-ით
    let conversation = await Conversation.findOne({ customId });

    // 🆕 თუ არ მოიძებნა, შექმენი ახალი ჩატი
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

    // ➕ დაამატე sender როგორც მონაწილე, თუ ჯერ არ არის სიაში
    if (!conversation.participants.some(p => p.id === sender.id)) {
        conversation.participants.push(sender);
    }

    // 💾 შეინახე ახალი შეტყობინება
    const messageDoc = await Message.create({
        conversationId: conversation._id,
        sender,
        text,
        timestamp,
        read: false,
    });

    // 🔄 conversation-ის განახლება ბოლო შეტყობინებით
    conversation.lastMessage = messageDoc._id;
    conversation.lastUpdated = timestamp;
    conversation.unreadCount += 1;

    // 📥 ჩატის შენახვა
    await conversation.save();

    // 🔔 Socket.io სიგნალი ფრონტისთვის
    io.emit("conversationUpdated", {
        customId: conversation._id, // ⚠️ ამას შეიძლება დავარქვათ `id` — თუ `_id`-ს იყენებს ფრონტი
        platform,
        text,
        timestamp,
        sender,
    });

    return conversation;
}
