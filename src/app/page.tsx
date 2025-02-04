"use client";

import React from "react";

const SpotifyLoginButton: React.FC = () => {
  const handleLogin = () => {
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

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className={"font-extrabold text-4xl self-center"}>Jukebox</h1>
        <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li>Connect with spotify.</li>
          <li>Select your device.</li>
          <li>Add songs to the queue</li>
          <li>Let&#39;s vote</li>
        </ol>
        <SpotifyLoginButton />
      </main>
    </div>
  );
}
