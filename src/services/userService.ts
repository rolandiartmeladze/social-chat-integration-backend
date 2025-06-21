import { User } from "../models/User";

interface OAuthUserInput {
  customId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  provider: string;
}

// თუ მომხმარებელი უკვე არსებობს, დააბრუნე, თუ არა — შექმენი
export async function upsertOAuthUser(input: OAuthUserInput) {
  let user = await User.findOne({ customId: input.customId });

  if (!user) {
    // ახალი მომხმარებლის შექმნა
    user = await User.create({
      ...input
    });
  } else {
    // არსებული მომხმარებლის ბოლო შესვლის განახლება
    user.lastLogin = new Date();
    await user.save();
  }

  return user; // დააბრუნე მომხმარებლის ობიექტი, რომელიც სესიაში ჩაიწერება
}
