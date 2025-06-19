import { Schema, model, Document, Types } from "mongoose";

export interface IPlatform extends Document {
  userId: Types.ObjectId;
  platformName: "google" | "facebook" | "telegram" | "instagram";
  platformUserId: string;
  username?: string;
  email?: string;
  avatarUrl?: string;
  encryptedAccessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  status: "active" | "expired" | "revoked";
  connectedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PlatformSchema = new Schema<IPlatform>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  platformName: { type: String, enum: ["google", "facebook", "telegram", "instagram"], required: true },
  platformUserId: { type: String, required: true },
  username: { type: String },
  email: { type: String },
  avatarUrl: { type: String },
  encryptedAccessToken: { type: String, required: true },
  refreshToken: { type: String },
  expiresAt: { type: Date },
  status: { type: String, enum: ["active", "expired", "revoked"], default: "active" },
  connectedAt: { type: Date, default: Date.now }
}, { timestamps: true });

PlatformSchema.index({ userId: 1, platformName: 1, platformUserId: 1 }, { unique: true });

export const Platform = model<IPlatform>("Platform", PlatformSchema);
