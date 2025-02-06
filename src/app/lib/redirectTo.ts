import { NextResponse } from "next/server";

export const redirectTo = (path: string, request: Request) => {
  const serverUrl = request.headers.has("host")
    ? "http://" + request.headers.get("host")
    : request.url;
  return NextResponse.redirect(new URL(path, serverUrl));
};
