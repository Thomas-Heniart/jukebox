"use server";

import { NextResponse } from "next/server";

export async function GET() {
  const scope = [
    "user-read-private",
    "user-read-playback-state",
    "user-modify-playback-state",
    "user-read-email",
    "playlist-read-private",
    "streaming",
    "playlist-modify-private",
    "playlist-modify-public",
  ].join(" ");

  const queryParams = new URLSearchParams({
    response_type: "code",
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    redirect_uri: encodeURIComponent(process.env.SPOTIFY_REDIRECT_URI!),
    scope,
  });

  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_SPOTIFY_AUTH_URL}?${queryParams}`,
  );
}
