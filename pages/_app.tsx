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
                    className="flex items-center w-full h-screen-7.5"
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
