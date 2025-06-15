import { Schema, model, Document, Types } from "mongoose";

export interface IParticipant {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface IConversation extends Document {
  customId: string;
  platform: string;
  participants: IParticipant[];
  lastMessage?: Types.ObjectId;
  lastUpdated: Date;
  unreadCount: number;
  taskId?: Types.ObjectId;
  status: "open" | "closed" | "archived";
}

const ParticipantSchema = new Schema<IParticipant>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  avatarUrl: { type: String },
});

const ConversationSchema = new Schema<IConversation>({
  customId: { type: String, required: true, unique: true, index: true },
  platform: { type: String, required: true, index: true },
  participants: {
    type: [ParticipantSchema],
    required: true,
    validate: [(val: IParticipant[]) => val.length > 0, "At least one participant required"]
  },
  lastMessage: { type: Schema.Types.ObjectId, ref: "Message" },
  lastUpdated: { type: Date, default: Date.now },
  unreadCount: { type: Number, default: 0 },
  taskId: { type: Schema.Types.ObjectId, ref: "Task" },
  status: { type: String, enum: ["open", "closed", "archived"], default: "open" },
}, { timestamps: true });

ConversationSchema.index({ platform: 1, "participants.id": 1 });

export const Conversation = model<IConversation>("Conversation", ConversationSchema);
