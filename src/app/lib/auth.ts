"use server";

import { cookies } from "next/headers";
import { v4 } from "uuid";

export const getUserId = async () => {
  const cookieStore = await cookies();
  if (!cookieStore.has("uid"))
    cookieStore.set({
      name: "uid",
      value: v4(),
      httpOnly: true,
      path: "/",
    });
  return cookieStore.get("uid")!.value!;
};
