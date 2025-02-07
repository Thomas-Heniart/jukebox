import React from "react";
import { SpotifyLoginButton } from "@/app/components/spotifyLoginButton";

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
