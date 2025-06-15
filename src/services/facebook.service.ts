import axios from "axios";

export async function getFacebookPageInfo(accessToken: string) {
  const { data } = await axios.get("https://graph.facebook.com/me", {
    params: {
      access_token: accessToken,
      fields: "id,name",
    },
  });
  return data;
}
