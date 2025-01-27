"use client";
import React, { MouseEventHandler, useEffect, useState } from "react";
import { DeviceVM } from "@/app/devices/typing";
import { getDevices, selectDevice } from "@/app/devices/action";

export default function Devices() {
  const [devices, setDevices] = useState<DeviceVM[]>([]);

  useEffect(() => {
    getDevices().then(setDevices).catch(console.error);
  }, []);

  const onClick =
    (deviceId: string): MouseEventHandler<HTMLLIElement> =>
    (e) => {
      e.preventDefault();
      selectDevice(deviceId).catch(console.error);
    };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <ol>
          {devices.map((device) => (
            <li
              key={device.id}
              onClick={onClick(device.id)}
              className={
                "grid grid-cols-[100px_1fr] gap-4 items-center m-2 hover:cursor-pointer hover:bg-gray-600 transition-colors rounded"
              }
            >
              {device.name} - {device.type}
            </li>
          ))}
        </ol>
      </main>
    </div>
  );
}
