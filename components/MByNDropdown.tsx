import React, { useRef } from "react";
import useIsMobile from "../hooks/useIsMobile";

type Props = {
    mByN: Function;
    m: number;
    n: number;
};

function MByNDropdown({ mByN, m, n }: Props): JSX.Element {
    const mSelectRef = useRef<HTMLSelectElement>(null);
    const nSelectRef = useRef<HTMLSelectElement>(null);
    const isMobile: boolean = useIsMobile();

    const changeHandler = () => {
        if (mSelectRef.current === null || nSelectRef.current === null) return;
        const newM = parseInt(mSelectRef.current.value, 10);
        const newN = parseInt(nSelectRef.current.value, 10);
        mByN(newM, newN);
    };

    const scrollHandler = (event: React.WheelEvent<HTMLSelectElement>) => {
        if (mSelectRef.current === null || nSelectRef.current === null) return;
        if (event.target instanceof HTMLSelectElement) {
            const mOrN = event.target.id;
            if (event.deltaY < 0) {
                if (mOrN === "m") {
                    const newM = parseInt(mSelectRef.current.value, 10) + 1;
                    if (!(newM > 16 && newM !== 0)) mByN(newM, n);
                } else {
                    const newN = parseInt(nSelectRef.current.value, 10) + 1;
                    if (!(newN > 16) && newN !== 0) mByN(m, newN);
                }
            } else if (mOrN === "m") {
                const newM = parseInt(mSelectRef.current.value, 10) - 1;
                if (!(newM > 16) && newM !== 0) mByN(newM, n);
            } else {
                const newN = parseInt(nSelectRef.current.value, 10) - 1;
                if (!(newN > 16) && newN !== 0) mByN(m, newN);
            }
        }
    };

    const containerStyle: React.CSSProperties = {
        height: `${(isMobile ? 50 : 20).toString()}%`,
        width: `${(100).toString()}%`,
    };

    const ddStyle: React.CSSProperties = {
        height: `${(50).toString()}%`,
        width: `${(45).toString()}%`,
    };

    const options: Array<JSX.Element> = [];
    for (let i = 1; i < 17; i++) {
        options.push(
            <option value={i} key={i}>
                {i}
            </option>,
        );
    }

    return (
        <div
            className="flex items-center justify-between"
            style={containerStyle}
        >
            <select
                className="text-white bg-zinc-800 cursor-pointer text-center border-2 border-teal-50 rounded-xl font-mono text-3xl w-full"
                style={ddStyle}
                ref={mSelectRef}
                value={m}
                id="m"
                onChange={changeHandler}
                onWheel={scrollHandler}
            >
                {options}
            </select>
            <div className="text-white font-mono text-3xl">x</div>
            <select
                className="text-white bg-zinc-800 cursor-pointer text-center border-2 border-teal-50 rounded-xl font-mono text-3xl w-full"
                style={ddStyle}
                ref={nSelectRef}
                value={n}
                id="n"
                onChange={changeHandler}
                onWheel={scrollHandler}
            >
                {options}
            </select>
        </div>
    );
}

export default MByNDropdown;
