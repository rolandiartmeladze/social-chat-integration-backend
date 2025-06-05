import { getUserAvatar } from "./getUserAvatar";
import { User, Participants } from "../types/types"

export async function getParticipants(
    participantsRaw: any[],
    pageId: string | null,
    accessToken: string
): Promise<Participants> {
    const UnknownUser: User = { id: "", name: "Unknown", avatarUrl: "" };
    const pageParticipantRaw = participantsRaw.find((p) => p.id === pageId);
    const userParticipantRaw = participantsRaw.find((p) => p.id !== pageId);

    const user: User = userParticipantRaw ? 
        {
            id: userParticipantRaw.id,
            name: userParticipantRaw.name || "Unknown",
            avatarUrl: await getUserAvatar(userParticipantRaw.id, accessToken) || "",
        } : UnknownUser;

    const page: User = pageParticipantRaw ?
        {
            id: pageParticipantRaw.id,
            name: pageParticipantRaw.name || "Unknown",
            avatarUrl: await getUserAvatar(pageParticipantRaw.id, accessToken) || "",
        } : UnknownUser;

    return { user: user, page: page };
}
