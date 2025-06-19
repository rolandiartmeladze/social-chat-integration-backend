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
    const response = await axios.get(
      `https://graph.facebook.com/v17.0/${userId}/picture`,
      {
        params: {
          access_token: accessToken,
          redirect: false,
        },
      }
    );

    const url = response.data?.data?.url || "";
    if (url) {
      avatarCache.set(userId, url);
      return url;
    } else {
      console.warn("Avatar URL not found for user:", userId);
      return "";
    }
  } catch (err) {
    console.error("Error fetching avatar for user:", userId, err);
    return "";
  }
};
