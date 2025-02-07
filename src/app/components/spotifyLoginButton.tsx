"use client";

import React, { MouseEventHandler } from "react";

export const SpotifyLoginButton: React.FC = () => {
  const handleLogin: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    window.location.href = "/api/auth/spotify/login";
  };

  return (
    <button
      onClick={handleLogin}
      className="
            rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 hover:bg-white hover:text-green-500 bg-green-500 text-white p-2 self-center"
    >
      Connect with Spotify
    </button>
  );
};
