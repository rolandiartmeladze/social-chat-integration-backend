import { Schema, model, Document } from "mongoose";

export interface ISession extends Document {
  sessionId: string;
  userId: Schema.Types.ObjectId;
  expiresAt: Date;
  data: any;
}

const SessionSchema = new Schema<ISession>({
  sessionId: { type: String, required: true, unique: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  expiresAt: { type: Date, required: true },
  data: { type: Schema.Types.Mixed },
});

export const Session = model<ISession>("Session", SessionSchema);
