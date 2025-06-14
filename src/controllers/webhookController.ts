import { Request, Response } from "express";
import { io } from "../socket";
import {IncomingMessagePayload } from "../types/types";  
export default class WebhookController {
  static handleIncomingMessage(payload: IncomingMessagePayload) {
    io.emit("new_message", payload);
  }
}