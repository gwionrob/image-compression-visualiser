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
                    if (!(newM > (isMobile ? 9 : 16)) && newM !== 0)
                        mByN(newM, n);
                } else {
                    const newN = parseInt(nSelectRef.current.value, 10) + 1;
                    if (!(newN > (isMobile ? 9 : 16)) && newN !== 0)
                        mByN(m, newN);
                }
            } else if (mOrN === "m") {
                const newM = parseInt(mSelectRef.current.value, 10) - 1;
                if (!(newM > (isMobile ? 9 : 16)) && newM !== 0) mByN(newM, n);
            } else {
                const newN = parseInt(nSelectRef.current.value, 10) - 1;
                if (!(newN > (isMobile ? 9 : 16)) && newN !== 0) mByN(m, newN);
            }
        }
    };

    const containerStyle: React.CSSProperties = {
        height: `${(isMobile ? 50 : 25).toString()}%`,
        width: `${(100).toString()}%`,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    };

    const ddStyle: React.CSSProperties = {
        height: `${(50).toString()}%`,
        width: `${(45).toString()}%`,
        background: "#363434",
    };

    const options: Array<JSX.Element> = [];
    const maxOptions: number = isMobile ? 10 : 17;
    for (let i = 1; i < maxOptions; i++) {
        options.push(
            <option value={i} key={i}>
                {i}
            </option>,
        );
    }

    return (
        <div className="m-by-n-dd" style={containerStyle}>
            <select
                style={ddStyle}
                ref={mSelectRef}
                value={m}
                id="m"
                onChange={changeHandler}
                onWheel={scrollHandler}
            >
                {options}
            </select>
            <div className="x">x</div>
            <select
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
