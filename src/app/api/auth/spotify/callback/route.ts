"use server";

import { NextResponse } from "next/server";
import axios from "axios";
import { AccessToken } from "@spotify/web-api-ts-sdk";
import { jukebox } from "@/app/config/config";

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

    jukebox().authenticateWith(response.data);

    process.env.SPOTIFY_ACCESS_TOKEN = JSON.stringify(response.data);
    return NextResponse.redirect(new URL("/devices", request.url));

    // const {access_token, refresh_token, expires_in} = response.data;
    // Optional: Save tokens in a cookie, session, or database
    // return NextResponse.json({access_token, refresh_token, expires_in});
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to exchange authorization code" },
      { status: 500 },
    );
  }
}
