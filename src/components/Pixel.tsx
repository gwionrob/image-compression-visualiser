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
        <div className="pixel-container" id={id} ref={innerRef} style={style}>
            <button
                type="button"
                aria-label="pixel-button"
                className="pixel"
                style={{
                    background: `rgb(${pixelCol.r}, ${pixelCol.g}, ${pixelCol.b})`,
                }}
            />
        </div>
    );
}

export default Pixel;
