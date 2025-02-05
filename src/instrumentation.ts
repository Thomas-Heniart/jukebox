import { configureDependencies } from "@/shared-kernel/configuration/di";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") configureDependencies();
}
