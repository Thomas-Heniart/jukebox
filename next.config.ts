import type {NextConfig} from "next";
import {DependencyContainer} from "@/shared-kernel/configuration/dependency-container/dependencyContainer";

const nextConfig: NextConfig = {
    images: {
        dangerouslyAllowSVG: true,
        remotePatterns: [
            {
                protocol: "https",
                hostname: "placehold.co",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "i.scdn.co",
                pathname: "/**",
            }
        ],
    },
    serverRuntimeConfig: {
        dependencyContainer: new DependencyContainer()
    }
    /* config options here */
};

export default nextConfig;
