"use client";

import Image from "next/image";
import React, { MouseEventHandler, useEffect, useState } from "react";
import AppContainer from "@/app/layouts/appContainer";
import {
  getCurrentTrack,
  queuedTracks,
  voteTrack,
} from "@/app/tracks-queue/actions";
import { format } from "date-fns";
import { QueuedTrackVM } from "@/jukebox-context/view-models/queuedTrackVM";
import { CurrentTrackVM } from "@/jukebox-context/view-models/currentTrackVM";

const formatTime = (ms: number): string => {
  const date = new Date(ms);
  return ms >= 3600000 ? format(date, "HH:mm:ss") : format(date, "mm:ss");
};

const CurrentTrackFooter = ({ track }: { track: CurrentTrackVM }) => {
  const [progress, setProgress] = useState(track.progress);

  useEffect(() => {
    setProgress(track.progress);
  }, [track.progress]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (progress >= track.duration) return clearInterval(timer);
      setProgress(progress + 1000);
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [progress, track.duration]);

  if (!track) return <></>;

  return (
    <div className="fixed self-center justify-self-center w-full bottom-0 grid grid-cols-2 grid-rows-2 bg-gray-800 items-center">
      <Image
        className="row-span-2 justify-self-end p-2"
        src={track.imageUri}
        width={100}
        height={100}
        alt={track.title}
      />
      <div className={"overflow-hidden"}>
        <div className={"animate-marquee whitespace-nowrap font-bold min-w-60"}>
          {track.title} - {track.artist}
        </div>
      </div>
      <div className="col-start-2 row-start-2">
        {formatTime(progress)} / {formatTime(track.duration)}
      </div>
    </div>
  );
};

export default function TracksQueue() {
  const [queue, setQueue] = useState<QueuedTrackVM[]>([]);
  const [currentTrack, setCurrentTrack] = useState<CurrentTrackVM | null>(null);

  useEffect(() => {
    getCurrentTrack().then(setCurrentTrack).catch(console.error);
    queuedTracks().then(setQueue).catch(console.error);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      getCurrentTrack().then(setCurrentTrack).catch(console.error);
      queuedTracks().then(setQueue).catch(console.error);
    }, 2000);
    return () => {
      clearInterval(timer);
    };
  }, []);

  const plusButtonColor = (track: QueuedTrackVM) => {
    if (track.voteStatus === "UP") return "text-green-500";
    return "text-grey-500";
  };

  const counterColor = (track: QueuedTrackVM) => {
    if (track.voteStatus === "UP") return "text-green-500";
    if (track.voteStatus === "DOWN") return "text-red-500";
    return "text-grey-500";
  };

  const minusButtonColor = (track: QueuedTrackVM) => {
    if (track.voteStatus === "DOWN") return "text-red-500";
    return "text-grey-500";
  };

  const onPlusClick =
    (
      track: QueuedTrackVM,
      index: number,
    ): MouseEventHandler<HTMLButtonElement> =>
    (e) => {
      e.preventDefault();
      if (track.voteStatus === "UP") return;
      voteTrack({
        trackId: track.id,
        vote: "UP",
      }).then(() =>
        setQueue(
          queue
            .map<QueuedTrackVM>((t, i) => {
              if (i != index) return t;
              return {
                ...t,
                votes: t.votes + (t.voteStatus === "DOWN" ? 2 : 1),
                voteStatus: "UP",
              };
            })
            .toSorted((t1, t2) => t2.votes - t1.votes),
        ),
      );
    };

  const onMinusClick =
    (
      track: QueuedTrackVM,
      index: number,
    ): MouseEventHandler<HTMLButtonElement> =>
    (e) => {
      e.preventDefault();
      if (track.voteStatus === "DOWN") return;
      voteTrack({
        trackId: track.id,
        vote: "DOWN",
      }).then(() =>
        setQueue(
          queue
            .map<QueuedTrackVM>((t, i) => {
              if (i != index) return t;
              return {
                ...t,
                votes: t.votes - (t.voteStatus === "UP" ? 2 : 1),
                voteStatus: "DOWN",
              };
            })
            .toSorted((t1, t2) => t2.votes - t1.votes),
        ),
      );
    };

  return (
    <AppContainer currentPage={"tracks-queue"}>
      <h1 className="font-bold text-2xl">Tracks Queue - vote for your song</h1>
      <div className={"flex flex-col gap-2"}>
        {queue.map((track, i) => (
          <div
            key={`${i}-${track.id}`}
            className={
              "grid grid-cols-3 gap-4 items-center m-2 hover:bg-gray-600 transition-colors rounded w-full"
            }
          >
            <Image
              src={track.imageUri}
              alt={track.title}
              width={100}
              height={100}
              className={"rounded"}
            />
            <span className={"align-self-center"}>
              {track.title} - {track.artist}
            </span>
            <div className={"flex flex-col items-center justify-center"}>
              <button
                onClick={onPlusClick(track, i)}
                className={plusButtonColor(track) + " hover:cursor-pointer"}
              >
                +
              </button>
              <span className={counterColor(track)}>{track.votes}</span>
              <button
                onClick={onMinusClick(track, i)}
                className={minusButtonColor(track) + " hover:cursor-pointer"}
              >
                -
              </button>
            </div>
          </div>
        ))}
      </div>
      {/*<ol className="w-full">*/}
      {/*  {queue.map((track, i) => (*/}
      {/*    <li*/}
      {/*      key={`${i}-${track.id}`}*/}
      {/*      className={*/}
      {/*        "grid grid-cols-3 gap-4 items-center m-2 hover:bg-gray-600 transition-colors rounded w-full"*/}
      {/*      }*/}
      {/*    >*/}
      {/*      <Image*/}
      {/*        src={track.imageUri}*/}
      {/*        alt={track.title}*/}
      {/*        width={100}*/}
      {/*        height={100}*/}
      {/*        className={"rounded"}*/}
      {/*      />*/}
      {/*      <span className={"align-self-center"}>*/}
      {/*        {track.title} - {track.artist}*/}
      {/*      </span>*/}
      {/*      <div className={"flex flex-col items-center justify-center"}>*/}
      {/*        <button*/}
      {/*          onClick={onPlusClick(track, i)}*/}
      {/*          className={plusButtonColor(track) + " hover:cursor-pointer"}*/}
      {/*        >*/}
      {/*          +*/}
      {/*        </button>*/}
      {/*        <span className={counterColor(track)}>{track.votes}</span>*/}
      {/*        <button*/}
      {/*          onClick={onMinusClick(track, i)}*/}
      {/*          className={minusButtonColor(track) + " hover:cursor-pointer"}*/}
      {/*        >*/}
      {/*          -*/}
      {/*        </button>*/}
      {/*      </div>*/}
      {/*    </li>*/}
      {/*  ))}*/}
      {/*</ol>*/}
      {currentTrack && <CurrentTrackFooter track={currentTrack} />}
    </AppContainer>
  );
}
