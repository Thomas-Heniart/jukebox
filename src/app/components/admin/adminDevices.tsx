import React, { MouseEventHandler, useEffect, useState } from "react";
import { DeviceVM } from "@/jukebox-context/view-models/deviceVM";
import { getDevices, selectDevice } from "@/app/dreadhop/devices/actions";
import { isLoggedInToClient } from "@/app/dreadhop/actions";
import AppContainer from "@/app/layouts/appContainer";
import { Loader } from "@/app/components/loader";
import Image from "next/image";

const paths: Record<string, string> = {
  Smartphone: "/smartphone.png",
  Computer: "/computer.png",
} as const;

const deviceImage = (type: DeviceVM["type"]) => {
  const path = paths[type] || "/playlist-placeholder.png";
  return <Image src={path} alt={type} width={98} height={98} />;
};

export const AdminDevices = ({ clientId }: { clientId: string }) => {
  const [devices, setDevices] = useState<DeviceVM[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const retrieveDevices = async () => {
    setIsLoading(true);
    try {
      const devices = await getDevices();
      setDevices(devices);
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
          retrieveDevices()
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
    (deviceId: string, name: string): MouseEventHandler<HTMLLIElement> =>
    (e) => {
      e.preventDefault();
      setIsLoading(true);
      selectDevice(deviceId, name).catch((e) => {
        console.error(e);
        setIsLoading(false);
      });
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

  if (!devices.length)
    return (
      <AppContainer withHeader={false}>
        <h1 className={"font-extrabold text-2xl"}>No device available</h1>
        <h2 className={"font-bold text-xl"}>
          Make sure you are playing a song on your device
        </h2>
        <button
          className={"rounded-2xl bg-blue-950 text-white p-2"}
          onClick={() => retrieveDevices()}
        >
          Try again
        </button>
      </AppContainer>
    );

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
};
