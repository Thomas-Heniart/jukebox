"use client";
import React, { MouseEventHandler, useEffect, useState } from "react";
import { useDebouncedValue } from "@/app/hooks/debounce";
import Image from "next/image";
import { searchAction } from "@/app/search/action";
import { TrackResultVM } from "@/app/search/typing";
import { queueTrack } from "@/app/track/actions";

export default function Search() {
  const [search, setSearch] = useState("");
  const [tracks, setTracks] = useState<TrackResultVM[]>([]);

  const debouncedSearch = useDebouncedValue(search, 500);

  useEffect(() => {
    searchAction(debouncedSearch).then(setTracks).catch(console.error);
  }, [debouncedSearch]);

  const onClick =
    (trackUri: string): MouseEventHandler<HTMLLIElement> =>
    (e) => {
      e.preventDefault();
      queueTrack(trackUri).catch(console.error);
    };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={
            "rounded-full border border-solid border-transparent transition-colors p-8 text-xl font-[family-name:var(--font-geist-sans)] text-black focus:outline-none"
          }
          type="text"
          placeholder={"Title, Artist, ..."}
        />
        <ol>
          {tracks.map((track) => (
            <li
              key={track.id}
              onClick={onClick(track.uri)}
              className={
                "grid grid-cols-[100px_1fr] gap-4 items-center m-2 hover:cursor-pointer hover:bg-gray-600 transition-colors rounded"
              }
            >
              <Image
                src={track.imageUri}
                alt={track.title}
                width={100}
                height={100}
                className={"rounded"}
              />
              {track.title} - {track.artist}
            </li>
          ))}
        </ol>
      </main>
    </div>
  );
}
