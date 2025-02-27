"use server";

import { NextResponse } from "next/server";
import axios from "axios";
import { AccessToken } from "@spotify/web-api-ts-sdk";
import { jukebox } from "@/shared-kernel/configuration/di";
import { redirectTo } from "@/app/lib/redirectTo";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json(
      { error: "Authorization code missing" },
      { status: 400 },
    );
  }

  try {
    const response = await axios.post<AccessToken>(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
        client_id: process.env.SPOTIFY_CLIENT_ID!,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET!,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );
    (await jukebox()).clearRefreshTokenTimeout();
    await (await jukebox()).authenticateWith(response.data);

    return redirectTo("/devices", request);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to exchange authorization code" },
      { status: 500 },
    );
  }
}
