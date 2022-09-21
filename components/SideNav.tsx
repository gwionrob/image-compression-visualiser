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
            className="flex flex-col h-full fixed z-10 top-0 left-0 bg-zinc-900 transition-all duration-500 ease-out overflow-hidden"
            style={{ width: navWidth }}
        >
            <button
                id="closeNav"
                className="absolute top-[4px] left-[22px] mr-auto bg-transparent text-[red] border-none text-3xl font-mono cursor-pointer"
                type="button"
                onClick={closeNav}
            >
                X
            </button>
            <Link href="/">
                <a
                    id="homeLink"
                    className="text-red-700 hover:text-[red] font-mono text-2xl mt-[50px] ml-[30px] whitespace-nowrap cursor-pointer no-underline"
                    onClick={closeNav}
                    style={
                        router.pathname === "/" ? { color: "red" } : undefined
                    }
                >
                    Home
                </a>
            </Link>
            <Link href="/about">
                <a
                    id="aboutLink"
                    className="text-red-700 hover:text-[red] font-mono text-2xl mt-[50px] ml-[30px] whitespace-nowrap cursor-pointer no-underline"
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
            <button
                id="visualiserToggle"
                className="text-red-700 hover:text-[red] font-mono text-2xl mt-[50px] ml-[30px] whitespace-nowrap cursor-pointer no-underline text-left"
                type="button"
                onClick={toggleDd}
                style={
                    ["K M", "Dis", "Fra"].includes(currentTab.slice(0, 3))
                        ? { color: "red" }
                        : undefined
                }
            >
                Visualiser
            </button>
            <div
                id="visualiserLinksContainer"
                className="flex flex-col transition-all duration-200 ease-in ml-[50px] overflow-hidden"
                style={{ height: ddHeight }}
            >
                <Link href="/visualiser/k-means">
                    <a
                        id="kMeansLink"
                        className="text-red-700 hover:text-[red] font-mono text-2xl mt-[50px] ml-[30px] whitespace-nowrap cursor-pointer no-underline"
                        onClick={closeNav}
                        style={
                            currentTab.slice(0, 3) === "K M"
                                ? { color: "red" }
                                : undefined
                        }
                    >
                        K-Means
                    </a>
                </Link>
                <Link href="/visualiser/dct">
                    <a
                        id="dctLink"
                        className="text-red-700 hover:text-[red] font-mono text-2xl mt-[50px] ml-[30px] whitespace-nowrap cursor-pointer no-underline"
                        onClick={closeNav}
                        style={
                            currentTab.slice(0, 3) === "Dis"
                                ? { color: "red" }
                                : undefined
                        }
                    >
                        Discrete Cosine Transform
                    </a>
                </Link>
                <Link href="/visualiser/fractal-compression">
                    <a
                        id="fracCompLink"
                        className="text-red-700 hover:text-[red] font-mono text-2xl mt-[50px] ml-[30px] whitespace-nowrap cursor-pointer no-underline"
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
        </div>
    );
}

export default SideNav;
