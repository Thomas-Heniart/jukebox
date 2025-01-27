import getConfig from "next/config";
import { DependencyContainer } from "@/shared-kernel/configuration/dependency-container/dependencyContainer";

export const appContainer = () => {
  const { serverRuntimeConfig } = getConfig();
  return serverRuntimeConfig.dependencyContainer as DependencyContainer;
};
