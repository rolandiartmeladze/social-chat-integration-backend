import { IParticipant } from "../models/Conversation";

interface SplitParticipants {
  user: IParticipant;
  page: IParticipant;
}

export function splitParticipantsByRole(participants: IParticipant[], pageId: string) {
  const user = participants.find(p => p.id !== pageId) || null;
  const page = participants.find(p => p.id === pageId) || null;
  return { user, page };
}