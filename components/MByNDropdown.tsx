import React, { useState, useRef } from "react";
import useIsMobile from "../hooks/useIsMobile";

type Props = {
    mByN: Function;
    m: number;
    n: number;
    algo: string | string[] | undefined;
};

function MByNDropdown({ mByN, m, n, algo }: Props): JSX.Element {
    const mSelectRef = useRef<HTMLSelectElement>(null);
    const nSelectRef = useRef<HTMLSelectElement>(null);
    const [touchPos, setTouchPos] = useState<number>(0);
    const isMobile: boolean = useIsMobile();

    const changeHandler = () => {
        if (mSelectRef.current === null || nSelectRef.current === null) return;
        const newM = parseInt(mSelectRef.current.value, 10);
        const newN = parseInt(nSelectRef.current.value, 10);
        mByN(newM, newN);
    };

    const touchMoveHandler = (event: React.TouchEvent<HTMLSelectElement>) => {
        if (mSelectRef.current === null || nSelectRef.current === null) return;
        if (event.target instanceof HTMLSelectElement) {
            const mOrN = event.target.id;
            if (event.touches[0].clientY < touchPos) {
                if (mOrN === "m") {
                    const newM = parseInt(mSelectRef.current.value, 10) + 1;
                    if (newM <= (isMobile ? 16 : 25) && newM !== 0)
                        mByN(newM, n);
                } else {
                    const newN = parseInt(nSelectRef.current.value, 10) + 1;
                    if (newN <= (isMobile ? 16 : 25) && newN !== 0)
                        mByN(m, newN);
                }
            } else if (mOrN === "m") {
                const newM = parseInt(mSelectRef.current.value, 10) - 1;
                if (newM <= (isMobile ? 16 : 25) && newM !== 0) mByN(newM, n);
            } else {
                const newN = parseInt(nSelectRef.current.value, 10) - 1;
                if (newN <= (isMobile ? 16 : 25) && newN !== 0) mByN(m, newN);
            }
            setTouchPos(event.touches[0].clientY);
        }
    };

    const containerStyle: React.CSSProperties = {
        height: `${(isMobile ? 100 / 3 : 20).toString()}%`,
        width: `${(100).toString()}%`,
    };

    const ddStyle: React.CSSProperties = {
        height: `${(isMobile ? 90 : 50).toString()}%`,
        width: `${(45).toString()}%`,
    };

    const options: Array<JSX.Element> = [];
    if (algo === "dct") {
        for (let i = 8; i <= (isMobile ? 24 : 32); i += 8) {
            options.push(
                <option value={i} key={i}>
                    {i}
                </option>,
            );
        }
    } else {
        for (let i = 1; i <= (isMobile ? 16 : 25); i++) {
            options.push(
                <option value={i} key={i}>
                    {i}
                </option>,
            );
        }
    }

    return (
        <div
            id="mByNContainer"
            className="flex items-center justify-between"
            style={containerStyle}
        >
            <select
                id="m"
                className="text-white bg-zinc-800 cursor-pointer text-center border-2 border-teal-50 rounded-xl font-mono text-3xl w-full touch-none"
                style={ddStyle}
                ref={mSelectRef}
                value={m}
                onChange={changeHandler}
                onTouchMove={touchMoveHandler}
            >
                {options}
            </select>
            <div id="x" className="text-white font-mono text-3xl">
                x
            </div>
            <select
                id="n"
                className="text-white bg-zinc-800 cursor-pointer text-center border-2 border-teal-50 rounded-xl font-mono text-3xl w-full touch-none"
                style={ddStyle}
                ref={nSelectRef}
                value={n}
                onChange={changeHandler}
                onTouchMove={touchMoveHandler}
            >
                {options}
            </select>
        </div>
    );
}

export default MByNDropdown;
