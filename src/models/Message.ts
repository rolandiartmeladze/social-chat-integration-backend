import { Schema, model, Document } from "mongoose";

export interface IMessage extends Document {
  conversationId: Schema.Types.ObjectId;
  sender: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  text: string;
  timestamp: Date;
  read: boolean;
  taskId?: Schema.Types.ObjectId;
}

const MessageSchema = new Schema<IMessage>({
  conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true, index: true },
  sender: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    avatarUrl: { type: String },
  },
  text: { type: String, required: true },
  timestamp: { type: Date, required: true },
  read: { type: Boolean, default: false },
  taskId: { type: Schema.Types.ObjectId, ref: "Task" },
});

export const Message = model<IMessage>("Message", MessageSchema);
