import { Schema, model, Document } from "mongoose";

export interface IPlatform extends Document {
  userId: Schema.Types.ObjectId;
  platformName: string;
  platformUserId: string;
  encryptedAccessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  status: "active" | "expired" | "revoked";
  createdAt: Date;
  updatedAt: Date;
}

const PlatformSchema = new Schema<IPlatform>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  platformName: { type: String, required: true },
  platformUserId: { type: String, required: true },
  encryptedAccessToken: { type: String, required: true },
  refreshToken: { type: String },
  expiresAt: { type: Date },
  status: { type: String, enum: ["active", "expired", "revoked"], default: "active" },
}, { timestamps: true });

export const Platform = model<IPlatform>("Platform", PlatformSchema);
