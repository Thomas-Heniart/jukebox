import { configureDependencies } from "@/shared-kernel/configuration/configureDependencies";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await configureDependencies();
  }
}
