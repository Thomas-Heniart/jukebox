"use client";

import { MouseEventHandler, useEffect, useState } from "react";
import AppContainer from "@/app/layouts/appContainer";
import Image from "next/image";
import { PlaylistVM } from "@/app/playlists/typing";
import { getPlaylists, selectPlaylist } from "@/app/playlists/actions";

export default function Playlists() {
  const [playlists, setPlaylists] = useState<PlaylistVM[]>([]);

  useEffect(() => {
    getPlaylists().then(setPlaylists);
  }, []);

  const onClick =
    (playlist: PlaylistVM): MouseEventHandler<HTMLLIElement> =>
    (e) => {
      e.preventDefault();
      selectPlaylist(playlist).catch(console.error);
    };

  return (
    <AppContainer>
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
