import React, { LegacyRef } from "react";

type RGB = { r: number; g: number; b: number };
type Props = {
    id: string;
    innerRef: LegacyRef<HTMLDivElement>;
    color: RGB;
    style: React.CSSProperties;
};

function Pixel({ id, innerRef, color, style }: Props) {
    const pixelCol = color === undefined ? { r: 0, g: 0, b: 0 } : color;

    return (
        <div
            id={id}
            className="relative border-2 border-teal-50 rounded-xl overflow-hidden"
            ref={innerRef}
            style={style}
        >
            <button
                id={`${id}Button`}
                className="h-full w-full border-none cursor-pointer"
                type="button"
                aria-label="pixel-button"
                style={{
                    background: `rgb(${pixelCol.r}, ${pixelCol.g}, ${pixelCol.b})`,
                }}
            />
        </div>
    );
}

export default Pixel;
