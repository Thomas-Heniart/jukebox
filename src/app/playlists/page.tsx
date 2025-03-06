"use client";

import React, { MouseEventHandler, useEffect, useState } from "react";
import AppContainer from "@/app/layouts/appContainer";
import Image from "next/image";
import { getPlaylists, selectPlaylist } from "@/app/playlists/actions";
import { PlaylistVM } from "@/jukebox-context/view-models/playlistVM";
import { Loader } from "@/app/components/loader";

export default function Playlists() {
  const [playlists, setPlaylists] = useState<PlaylistVM[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const retrievePlaylists = async () => {
    setIsLoading(true);
    try {
      const playlists = await getPlaylists();
      setPlaylists(playlists);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    retrievePlaylists().then();
  }, []);

  const onClick =
    (playlist: PlaylistVM): MouseEventHandler<HTMLLIElement> =>
    (e) => {
      e.preventDefault();
      setIsLoading(true);
      selectPlaylist(playlist)
        .catch((e) => {
          console.error(e);
          setPlaylists([]);
        })
        .finally(() => setIsLoading(false));
    };

  if (isLoading)
    return (
      <AppContainer withHeader={false}>
        <Loader />
      </AppContainer>
    );

  if (!playlists.length)
    return (
      <AppContainer withHeader={false}>
        <h1 className={"font-extrabold text-2xl"}>No playlist available</h1>
        <h2 className={"font-bold text-xl"}>
          Make sure you are playing a song on your device
        </h2>
        <button
          className={"rounded-2xl bg-blue-950 text-white p-2"}
          onClick={() => retrievePlaylists()}
        >
          Try again
        </button>
      </AppContainer>
    );

  return (
    <AppContainer withHeader={false}>
      <h1 className={"font-extrabold text-2xl"}>
        Choose a playlist to vote for your song
      </h1>
      <ol className={"grid grid-cols-1 gap-4"}>
        {playlists.map((playlist) => (
          <li
            key={playlist.id}
            className={
              "flex gap-4 cursor-pointer hover:bg-gray-600 transition-colors rounded items-center"
            }
            onClick={onClick(playlist)}
          >
            <Image
              className={"rounded"}
              src={playlist.coverUri}
              alt={playlist.name}
              width={98}
              height={98}
            />
            <span>{playlist.name}</span>
          </li>
        ))}
      </ol>
    </AppContainer>
  );
}
