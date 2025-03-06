"use client";

import React, { MouseEventHandler, useEffect, useState } from "react";

export const SpotifyLoginButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [extraClasses, setExtraClasses] = useState(
    "hover:bg-white hover:text-green-500 bg-green-500 text-white",
  );

  useEffect(() => {
    if (isLoading) setExtraClasses("bg-white text-green-500 animate-bounce");
    else
      setExtraClasses(
        "hover:bg-white hover:text-green-500 bg-green-500 text-white",
      );
  }, [isLoading]);

  const handleLogin: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    setIsLoading(true);
    window.location.href = "/api/auth/spotify/login";
  };

  return (
    <button
      onClick={handleLogin}
      disabled={isLoading}
      className={`rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 p-2 self-center ${extraClasses}`}
    >
      Connect with Spotify
    </button>
  );
};
