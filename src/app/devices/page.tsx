"use client";
import React, { MouseEventHandler, useEffect, useState } from "react";
import { getDevices, selectDevice } from "@/app/devices/actions";
import AppContainer from "@/app/layouts/appContainer";
import { DeviceVM } from "@/jukebox-context/view-models/deviceVM";
import Image from "next/image";

const paths: Record<string, string> = {
  Smartphone: "/smartphone.png",
  Computer: "/computer.png",
} as const;

const deviceImage = (type: DeviceVM["type"]) => {
  const path = paths[type] || "/playlist-placeholder.png";
  return <Image src={path} alt={type} width={98} height={98} />;
};

export default function Devices() {
  const [devices, setDevices] = useState<DeviceVM[]>([]);

  useEffect(() => {
    getDevices().then(setDevices).catch(console.error);
  }, []);

  const onClick =
    (deviceId: string, name: string): MouseEventHandler<HTMLLIElement> =>
    (e) => {
      e.preventDefault();
      selectDevice(deviceId, name).catch(console.error);
    };

  return (
    <AppContainer withHeader={false}>
      <h1 className={"font-extrabold text-2xl"}>Select your device</h1>
      <ol className={"grid grid-cols-1 gap-4"}>
        {devices.map((device) => (
          <li
            key={device.id}
            onClick={onClick(device.id, device.name)}
            className={
              "flex gap-4 cursor-pointer hover:bg-gray-600 transition-colors rounded items-center p-2"
            }
          >
            {deviceImage(device.type)}
            <span>{device.name}</span>
          </li>
        ))}
      </ol>
    </AppContainer>
  );
}
