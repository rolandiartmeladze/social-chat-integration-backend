import { Schema, model, Document } from "mongoose";

export interface IWebhookLog extends Document {
  platform: string;
  rawPayload: any;
  receivedAt: Date;
}

const WebhookLogSchema = new Schema<IWebhookLog>({
  platform: { type: String, required: true },
  rawPayload: { type: Schema.Types.Mixed, required: true },
  receivedAt: { type: Date, default: Date.now },
});

export const WebhookLog = model<IWebhookLog>("WebhookLog", WebhookLogSchema);
