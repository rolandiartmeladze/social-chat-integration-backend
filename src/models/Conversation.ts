import { Schema, model, Document, Types } from "mongoose";

export interface IParticipant {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface IMessage {
  senderId: string;
  text: string;
  timestamp: Date;
  read: boolean;
}

export interface IConversation extends Document {
  customId: string;
  platform: string;
  participants: IParticipant[];
  messages: IMessage[];
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

const MessageSchema = new Schema<IMessage>({
  senderId: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: () => new Date() },
  read: { type: Boolean, default: false },
});

const ConversationSchema = new Schema<IConversation>({
  customId: { type: String, required: true, unique: true, index: true },
  platform: { type: String, required: true, index: true },
  participants: { 
    type: [ParticipantSchema], 
    required: true, 
    validate: [(val: IParticipant[]) => val.length > 0, "Must have at least one participant"] 
  },
  messages: { type: [MessageSchema], default: [] },
  lastUpdated: { type: Date, default: Date.now, index: true },
  unreadCount: { type: Number, default: 0 },
  taskId: { type: Schema.Types.ObjectId, ref: "Task" },
  status: { type: String, enum: ["open", "closed", "archived"], default: "open", index: true },
}, { timestamps: true });

ConversationSchema.index({ platform: 1, "participants.id": 1 });

export const Conversation = model<IConversation>("Conversation", ConversationSchema);
