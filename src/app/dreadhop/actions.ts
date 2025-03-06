"use server";

import { getUserId } from "@/app/lib/auth";
import { adminStore } from "@/shared-kernel/configuration/di";

export const isLoggedInToClient = async (clientId: string) => {
  const userId = await getUserId();
  const store = await adminStore();
  return store.isLoggedIn(clientId, userId);
};

export const loginToClient = async (clientId: string, password: string) => {
  const userId = await getUserId();
  const store = await adminStore();
  store.login(clientId, userId, password);
  return store.isLoggedIn(clientId, userId);
};
