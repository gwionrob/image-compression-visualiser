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
                onChange={changeHandler}
            >
                {options}
            </select>
            <div className="x">x</div>
            <select
                style={ddStyle}
                ref={nSelectRef}
                value={n}
                onChange={changeHandler}
            >
                {options}
            </select>
        </div>
    );
}

export default MByNDropdown;
