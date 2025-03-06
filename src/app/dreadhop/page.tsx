"use client";

import React, { FormEventHandler, useEffect, useState } from "react";
import { SpotifyLoginButton } from "@/app/components/spotifyLoginButton";
import AppContainer from "@/app/layouts/appContainer";
import Image from "next/image";
import { Loader } from "@/app/components/loader";
import { isLoggedInToClient, loginToClient } from "@/app/dreadhop/actions";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [isPasswordInvalid, setIsPasswordInvalid] = useState(false);

  useEffect(() => {
    isLoggedInToClient("dreadhop")
      .then(setIsLoggedIn)
      .finally(() => setIsPageLoading(false));
  }, []);

  const onSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    setLoggingIn(true);
    loginToClient("dreadhop", password)
      .then((result) => {
        setIsLoggedIn(result);
        setIsPasswordInvalid(!result);
      })
      .finally(() => setLoggingIn(false));
  };

  if (isPageLoading)
    return (
      <AppContainer withHeader={false}>
        <Loader />
      </AppContainer>
    );

  if (!isLoggedIn)
    return (
      <AppContainer withHeader={false}>
        <div className={"flex items-center justify-center flex-col gap-8"}>
          <Image
            src={"/dreadhop/logo.png"}
            alt={"Dreagop logo"}
            width={360}
            height={360}
          ></Image>

          <form className="max-w-md mx-auto" onSubmit={onSubmit}>
            <div className="relative z-0 w-full mb-5 group">
              <input
                type="password"
                autoComplete={"off"}
                name="floating_password"
                id="floating_password"
                className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                placeholder=" "
                required
                value={password}
                onChange={(e) => setPassword(e.target.value || "")}
              />
              <label
                htmlFor="floating_password"
                className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 peer-focus:-mt-2 -mt-2"
              >
                Password
              </label>
            </div>
            <button
              disabled={loggingIn}
              type="submit"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-full px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 flex items-center justify-center"
            >
              {loggingIn ? <Loader /> : "Log In"}
            </button>
            {isPasswordInvalid && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                <span className="font-medium">Incorrect password!</span>
              </p>
            )}
          </form>
        </div>
      </AppContainer>
    );

  return (
    <AppContainer withHeader={false}>
      <div className={"flex items-center justify-center flex-col gap-8"}>
        <Image
          src={"/dreadhop/logo.png"}
          alt={"Dreagop logo"}
          width={360}
          height={360}
        ></Image>
        <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li>Your device is plugged and screen lock disabled</li>
          <li>Autoplay has to be turned off</li>
          <li>Make sure you are playing a song on your spotify app</li>
        </ol>
        <SpotifyLoginButton />
      </div>
    </AppContainer>
  );
}
