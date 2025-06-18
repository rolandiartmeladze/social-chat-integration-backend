import { Schema, model, Document, Types } from "mongoose";

/**
 * 🧍 ერთ-ერთი მონაწილე ჩატში — მომხმარებელი ან გვერდი/ბოტი
 */
export interface IParticipant {
  id: string;               // პლატფორმაზე უნიკალური იდენტიფიკატორი
  name: string;             // სახელი (მაგ. username ან სახელით)
  avatarUrl?: string;       // სურვილისამებრ პროფილის სურათის URL
}

/**
 * 💬 ჩატის მონაცემები — სხვადასხვა პლატფორმაზე
 */
export interface IConversation extends Document {
  customId: string;             // უნიკალური ID: <platform>-<userId>-<pageId>
  platform: string;             // messenger | telegram | instagram ...
  participants: IParticipant[]; // ჩატში ჩართულები (min 2)
  lastMessage?: Types.ObjectId; // ბოლო შეტყობინების ID
  lastUpdated: Date;            // ბოლო განახლების დრო
  unreadCount: number;          // წაუკითხავი შეტყობინებების რაოდენობა
  taskId?: Types.ObjectId;      // მიბმული დავალება (მაგ. support task)
  status: "open" | "closed" | "archived"; // ჩატის სტატუსი
}

// 🧱 სქემა ჩატის მონაწილეებისთვის
const ParticipantSchema = new Schema<IParticipant>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  avatarUrl: { type: String }, // სურათი არაა სავალდებულო
});

// 💬 ჩატის სქემა
const ConversationSchema = new Schema<IConversation>(
  {
    customId: {
      type: String,
      required: true,
      unique: true,
      index: true // სწრაფი ძებნისთვის
    },
    platform: {
      type: String,
      required: true,
      index: true
    },
    participants: {
      type: [ParticipantSchema],
      required: true,
      validate: [
        (val: IParticipant[]) => val.length > 0,
        "At least one participant required"
      ]
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message"
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    unreadCount: {
      type: Number,
      default: 0
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task"
    },
    status: {
      type: String,
      enum: ["open", "closed", "archived"],
      default: "open"
    },
  },
  { timestamps: true } // createdAt, updatedAt ავტომატურად დაემატება
);

// ინდექსი — პლატფორმაზე და მონაწილეებზე დაყრდნობით
ConversationSchema.index({ platform: 1, "participants.id": 1 });

export const Conversation = model<IConversation>("Conversation", ConversationSchema);
