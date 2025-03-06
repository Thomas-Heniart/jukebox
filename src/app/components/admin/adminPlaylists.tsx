import React, { MouseEventHandler, useEffect, useState } from "react";
import { PlaylistVM } from "@/jukebox-context/view-models/playlistVM";
import { getPlaylists, selectPlaylist } from "@/app/dreadhop/playlists/actions";
import { isLoggedInToClient } from "@/app/dreadhop/actions";
import AppContainer from "@/app/layouts/appContainer";
import { Loader } from "@/app/components/loader";
import Image from "next/image";

export const AdminPlaylists = ({ clientId }: { clientId: string }) => {
  const [playlists, setPlaylists] = useState<PlaylistVM[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
    isLoggedInToClient(clientId)
      .then((result) => {
        setIsLoggedIn(result);
        if (result)
          retrievePlaylists()
            .catch(console.error)
            .finally(() => setIsLoading(false));
        else setIsLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setIsLoading(false);
      });
  }, [clientId]);

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

  if (!isLoggedIn)
    return (
      <AppContainer withHeader={false}>
        <h1 className={"font-extrabold text-2xl"}>Not logged in</h1>
        <h2 className={"font-bold text-xl"}>Please log in to continue</h2>
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
};
