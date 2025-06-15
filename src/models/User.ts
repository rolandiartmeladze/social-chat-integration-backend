import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  googleId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  status: "active" | "inactive" | "banned";
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  googleId: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  name: { type: String, required: true },
  avatarUrl: { type: String },
  status: { type: String, enum: ["active", "inactive", "banned"], default: "active" },
}, { timestamps: true });

export const User = model<IUser>("User", UserSchema);
