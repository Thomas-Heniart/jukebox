"use server";

import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";

export const getUserId = async () => {
  const cookieStore = await cookies();
  if (!cookieStore.has("uid"))
    cookieStore.set({
      name: "uid",
      value: randomUUID(),
      httpOnly: true,
      path: "/",
    });
  return cookieStore.get("uid")!.value!;
};
