import React, { MouseEventHandler, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

type Props = {
    navWidth: string;
    closeNav: MouseEventHandler;
    currentTab: string;
};

function SideNav({ navWidth, closeNav, currentTab }: Props): JSX.Element {
    const [ddHeight, setDdHeight] = useState<string>("0%");
    const [dropDownVisible, setDropDownVisible] = useState<boolean>(false);
    const router = useRouter();

    const toggleDd = () => {
        setDdHeight(dropDownVisible ? "0%" : "40%");
        setDropDownVisible(!dropDownVisible);
    };

    return (
        <div
            id="sideNavContainer"
            className="fixed top-0 left-0 z-10 flex h-full flex-col overflow-hidden bg-zinc-900 transition-all duration-500 ease-out"
            style={{ width: navWidth }}
        >
            <button
                id="closeNav"
                className="absolute top-[4px] left-[22px] mr-auto cursor-pointer border-none bg-transparent font-mono text-3xl text-[red]"
                type="button"
                onClick={closeNav}
            >
                X
            </button>
            <button
                id="visualiserToggle"
                className="mt-[50px] ml-[30px] cursor-pointer whitespace-nowrap text-left font-mono text-2xl text-red-700 no-underline hover:text-[red]"
                type="button"
                onClick={toggleDd}
                style={
                    ["K M", "Dct", "Fra", "Ima"].includes(
                        currentTab.slice(0, 3),
                    )
                        ? { color: "red" }
                        : undefined
                }
            >
                Visualiser
            </button>
            <div
                id="visualiserLinksContainer"
                className="ml-[50px] flex flex-col overflow-hidden transition-all duration-200 ease-in"
                style={{ height: ddHeight }}
            >
                <Link href="/k-means">
                    <a
                        id="kMeansLink"
                        className="mt-[50px] ml-[30px] cursor-pointer whitespace-nowrap font-mono text-2xl text-red-700 no-underline hover:text-[red]"
                        onClick={closeNav}
                        style={
                            ["K M", "Ima"].includes(currentTab.slice(0, 3))
                                ? { color: "red" }
                                : undefined
                        }
                    >
                        K-Means
                    </a>
                </Link>
                <Link href="/dct">
                    <a
                        id="dctLink"
                        className="mt-[50px] ml-[30px] cursor-pointer whitespace-nowrap font-mono text-2xl text-red-700 no-underline hover:text-[red]"
                        onClick={closeNav}
                        style={
                            currentTab.slice(0, 3) === "Dct"
                                ? { color: "red" }
                                : undefined
                        }
                    >
                        Discrete Cosine Transform
                    </a>
                </Link>
                <Link href="/fractal-compression">
                    <a
                        id="fracCompLink"
                        className="mt-[50px] ml-[30px] cursor-pointer whitespace-nowrap font-mono text-2xl text-red-700 no-underline hover:text-[red]"
                        onClick={closeNav}
                        style={
                            currentTab.slice(0, 3) === "Fra"
                                ? { color: "red" }
                                : undefined
                        }
                    >
                        Fractal Compression
                    </a>
                </Link>
            </div>
            <Link href="/about">
                <a
                    id="aboutLink"
                    className="mt-[50px] ml-[30px] cursor-pointer whitespace-nowrap font-mono text-2xl text-red-700 no-underline hover:text-[red]"
                    onClick={closeNav}
                    style={
                        router.pathname === "/about"
                            ? { color: "red" }
                            : undefined
                    }
                >
                    About
                </a>
            </Link>
        </div>
    );
}

export default SideNav;
