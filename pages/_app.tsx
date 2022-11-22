import "../styles/globals.css";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import SideNav from "../components/SideNav";
import useIsMobile from "../hooks/useIsMobile";
import sideImg from "../public/sidebar-icon.png";
import type { AppProps } from "next/app";

const toTitle = (title: string | undefined) => {
    if (title === undefined) return "Image Compression Visualiser";
    let newTitle: string =
        title === "" ? "Image Compression Visualiser" : title;
    newTitle = newTitle.replaceAll("-", " ");
    return newTitle.replace(
        /\w\S*/g,
        (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase(),
    );
};

function MyApp({ Component, pageProps }: AppProps) {
    const [navWid, setNavWid] = useState<string>("0%");
    const [imageView, setImageView] = useState<boolean>(false);
    const isMobile: boolean = useIsMobile();
    const router = useRouter();
    const algo = router.query.algo as string;

    useEffect(() => {
        document.title = toTitle(algo);
    });

    const openSideNav = () => {
        setNavWid(isMobile ? "75%" : "25%");
    };

    const closeSideNav = () => {
        setNavWid("0%");
    };

    return (
        <div id="appContainer" className="flex justify-center">
            <div id="app" className="w-full">
                <div
                    id="topBar"
                    className="flex h-screen-7.5 w-full items-center justify-between"
                >
                    <button
                        id="openSideNav"
                        className="ml-3 h-2/3 w-[calc(2/3*10vh)] cursor-pointer border-none bg-transparent"
                        type="button"
                        onClick={openSideNav}
                    >
                        <Image
                            layout={"responsive"}
                            src={sideImg}
                            alt="sidenav button icon"
                        />
                    </button>
                    {algo || router.pathname === "/" ? (
                        <div className="mr-3 flex w-fit items-center justify-center">
                            <label
                                htmlFor="imageViewToggle"
                                className="flex cursor-pointer items-center"
                            >
                                <div className="mr-3 font-mono text-2xl text-white">
                                    Image View:
                                </div>
                                <div className="relative">
                                    <input
                                        id="imageViewToggle"
                                        type="checkbox"
                                        className="sr-only"
                                        onChange={(e) => {
                                            setImageView(e.target.checked);
                                        }}
                                    />
                                    <div className="h-4 w-10 rounded-full bg-gray-700 shadow-inner"></div>
                                    <div className="dot absolute -left-1 -top-1 h-6 w-6 rounded-full bg-gray-400 shadow transition"></div>
                                </div>
                            </label>
                        </div>
                    ) : null}
                </div>
                <SideNav
                    navWidth={navWid}
                    closeNav={closeSideNav}
                    currentTab={toTitle(algo)}
                />
                <Component {...pageProps} imageView={imageView} />
            </div>
        </div>
    );
}

export default MyApp;
