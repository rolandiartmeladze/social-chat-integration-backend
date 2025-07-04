import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  customId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  status: "active" | "inactive" | "banned";
  role: "user" | "admin" | "superadmin";
  provider: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  customId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  avatarUrl: { type: String },
  status: { type: String, enum: ["active", "inactive", "banned"], default: "active" },
  role: { type: String, enum: ["user", "admin", "superadmin"], default: "user" },
  provider: { type: String, enum: ["google", "facebook"], required: true },
  lastLogin: { type: Date, default: Date.now },
}, { timestamps: true });

export const User = model<IUser>("User", UserSchema);
