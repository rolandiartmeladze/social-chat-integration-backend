import axios from "axios";

export async function getFacebookPageIdFromInstagramAccount(
  igAccountId: string,
  accessToken: string
): Promise<string | null> {
  try {
    const response = await axios.get(
      `https://graph.facebook.com/v22.0/${igAccountId}`,
      {
        params: {
          fields: "connected_page",
          access_token: accessToken,
        },
      }
    );

    return response.data.connected_page?.id || null;
  } catch (error) {
    console.error("Failed to get connected Page ID:", error);
    return null;
  }
}
