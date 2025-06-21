import { User } from "../models/User";

interface OAuthUserInput {
  customId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  provider: string;
}

export async function upsertOAuthUser(input: OAuthUserInput) {
  let user = await User.findOne({ customId: input.customId });

  if (!user) {
    user = await User.create({
      ...input
    });
  } else {
    user.lastLogin = new Date();
    await user.save();
  }

  return user;
}
