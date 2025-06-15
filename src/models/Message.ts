import { Schema, model, Document, Types } from "mongoose";

export interface IMessage extends Document {
  _id: Types.ObjectId;
  conversationId: Types.ObjectId;
  sender: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  text: string;
  timestamp: Date;
  read: boolean;
  taskId?: Types.ObjectId;
}

const MessageSchema = new Schema<IMessage>({
  conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
  sender: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    avatarUrl: { type: String },
  },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
  taskId: { type: Schema.Types.ObjectId, ref: "Task" },
}, { timestamps: true });

export const Message = model<IMessage>("Message", MessageSchema);
