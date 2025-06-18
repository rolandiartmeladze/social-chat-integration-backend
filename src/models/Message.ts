import { Schema, model, Document, Types } from "mongoose";

/**
 * 💬 ერთი შეტყობინების მოდელი
 */
export interface IMessage extends Document {
  _id: Types.ObjectId;            // MongoDB გენერირებული უნიკალური ID
  conversationId: Types.ObjectId; // მიეკუთვნება რომელიმე Conversation-ს
  sender: {
    id: string;                   // პლატფორმის მომხმარებლის ან გვერდის ID
    name: string;                 // მომხმარებლის სახელი ან username
    avatarUrl?: string;           // სურათის URL (არასავალდებულო)
  };
  text: string;                   // შეტყობინების ტექსტი
  timestamp: Date;                // რეალური დრო, როცა შეტყობინება იქნა მიღებული ან გაგზავნილი
  read: boolean;                  // წაკითხულია თუ არა
  taskId?: Types.ObjectId;        // სურვილისამებრ მიბმული task ID
}

// 🧱 სქემა შეტყობინებისთვის
const MessageSchema = new Schema<IMessage>({
  conversationId: {
    type: Schema.Types.ObjectId,
    ref: "Conversation",
    required: true
  },
  sender: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    avatarUrl: { type: String }
  },
  text: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  read: {
    type: Boolean,
    default: false
  },
  taskId: {
    type: Schema.Types.ObjectId,
    ref: "Task"
  }
}, {
  timestamps: true // ➕ createdAt, updatedAt ავტომატურად დაემატება
});

// 📦 ექსპორტი გამოყენებისთვის
export const Message = model<IMessage>("Message", MessageSchema);
