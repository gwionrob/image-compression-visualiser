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
                    className="flex items-center w-full h-screen-7.5 justify-between"
                >
                    <button
                        id="openSideNav"
                        className="h-2/3 w-[calc(2/3*5vh)] ml-3 bg-transparent border-none cursor-pointer"
                        type="button"
                        onClick={openSideNav}
                    >
                        <Image
                            layout={"responsive"}
                            src={sideImg}
                            alt="sidenav button icon"
                        />
                    </button>
                    <div className="flex items-center justify-center w-fit mr-3">
                        <label
                            htmlFor="imageViewToggle"
                            className="flex items-center cursor-pointer"
                        >
                            <div className="mr-3 text-white font-mono text-2xl">
                                Image View:
                            </div>
                            <div className="relative">
                                <input
                                    id="imageViewToggle"
                                    type="checkbox"
                                    className="sr-only"
                                />
                                <div className="w-10 h-4 bg-gray-700 rounded-full shadow-inner"></div>
                                <div className="dot absolute w-6 h-6 bg-gray-400 rounded-full shadow -left-1 -top-1 transition"></div>
                            </div>
                        </label>
                    </div>
                </div>
                <SideNav
                    navWidth={navWid}
                    closeNav={closeSideNav}
                    currentTab={toTitle(algo)}
                />
                <Component {...pageProps} />
            </div>
        </div>
    );
}

export default MyApp;
