import axios from "axios";

const avatarCache = new Map<string, string>();

export const getUserAvatar = async (
  userId: string,
  accessToken: string
): Promise<string> => {
  if (!userId || !accessToken) return "";

  const cached = avatarCache.get(userId);
  if (cached) return cached;

  try {
    const res = await axios.get(`https://graph.facebook.com/${userId}`, {
      params: {
        fields: "picture",
        access_token: accessToken,
      },
    });

    const url = res.data.picture?.data?.url || "";
    avatarCache.set(userId, url);
    return url;
  } catch (err) {
    console.error("Error fetching avatar:", err);
    return "";
  }
};
