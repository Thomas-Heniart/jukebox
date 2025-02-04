"use client";
import React, { MouseEventHandler, useEffect, useState } from "react";
import { DeviceVM } from "@/app/devices/typing";
import { getDevices, selectDevice } from "@/app/devices/actions";
import AppContainer from "@/app/layouts/appContainer";

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
    <AppContainer>
      <ol>
        {devices.map((device) => (
          <li
            key={device.id}
            onClick={onClick(device.id, device.name)}
            className={
              "grid grid-cols-[100px_1fr] gap-4 items-center m-2 hover:cursor-pointer hover:bg-gray-600 transition-colors rounded"
            }
          >
            {device.name} - {device.type}
          </li>
        ))}
      </ol>
    </AppContainer>
  );
}
