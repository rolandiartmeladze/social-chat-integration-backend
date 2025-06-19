import { IParticipant } from "../models/Conversation";

interface SplitParticipants {
  user: IParticipant;
  page: IParticipant;
}

export function splitParticipantsByRole(
  participants: IParticipant[],
  pageOrBotId: string
): SplitParticipants {
  if (!Array.isArray(participants) || participants.length < 2) {
    throw new Error("Participants array must contain at least two entries.");
  }

  const page = participants.find(p => p.id === pageOrBotId);
  const user = participants.find(p => p.id !== pageOrBotId);

  if (!page || !user) {
    console.warn("⚠️ Participants could not be split correctly:", {
      participants,
      pageOrBotId,
    });
    throw new Error("Unable to identify both user and page participants.");
  }

  return { user, page };
}