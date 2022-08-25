import React, { useState, useRef, useEffect } from "react";
import DragSelect from "dragselect";
import { RgbColorPicker } from "react-colorful";
import CompressButton from "../../components/CompressButton";
import MByNDropdown from "../../components/MByNDropdown";
import Pixel from "../../components/Pixel";
import kMeans from "../../utilities/kmeans";
import useIsMobile from "../../hooks/useIsMobile";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";

type RGB = { r: number; g: number; b: number };

function Visualiser(): JSX.Element {
    const [k, setK] = useState<number>(3);
    const [columns, setNoOfColumns] = useState<number>(3);
    const [rows, setNoOfRows] = useState<number>(3);
    const [isHue, setIsHue] = useState<boolean>(false);
    const [colors, setColors] = useState<Array<RGB>>(
        Array(rows * columns).fill({ r: 0, g: 0, b: 0 }),
    );
    const [colAvg, setColAvg] = useState<RGB>({ r: 0, g: 0, b: 0 });
    const [displayColPick, setDisplayColPick] = useState<boolean>(false);
    const [selectedPixels, setSelectedPixels] = useState<Array<HTMLDivElement>>(
        [],
    );
    const compSelectRef = useRef<HTMLSelectElement>(null);
    const isMobile: boolean = useIsMobile();
    const colVRow: boolean = columns >= rows;
    const pixelDimensions: string = `calc((${
        isMobile ? "95vw" : "55vw"
    } / ${(colVRow ? columns : rows).toString()}) - 4px)`;
    const pixelRefs = useRef<Array<HTMLDivElement>>([]);
    const targetRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const { algo } = router.query;

    useEffect(() => {
        if (displayColPick || document.querySelector(".ds-selector-area")) {
            return undefined;
        }

        if (targetRef.current !== null) {
            const dragSelect = new DragSelect({
                selectables: pixelRefs.current.filter((el) => el !== null),
                area: targetRef.current,
                draggability: false,
                customStyles: true,
            });
            dragSelect.subscribe("callback", (e: CallbackObject) => {
                if (e.items !== undefined) {
                    setSelectedPixels(e.items);
                    const selectedColors: Array<Array<number>> = [];
                    const colArray: Array<Array<number>> = colors.map((col) =>
                        Object.values(col),
                    );
                    e.items.forEach((el: HTMLDivElement) => {
                        el.classList.add("selected");
                        selectedColors.push(colArray[parseInt(el.id, 10)]);
                    });
                    setDisplayColPick(true);
                    setColAvg(kMeans(selectedColors, 1)[0]);
                    dragSelect.stop();
                }
            });
        }

        return () => {
            document.querySelector(".ds-selector-area")?.remove();
        };
    }, [rows, columns, displayColPick, colors]);

    const algoChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        router.push(`/visualiser/${event.target.value}`);
    };

    const mByN = (m: number, n: number) => {
        if ((m === rows && n === columns) || m * n === 1) return;
        document.querySelector(".ds-selector-area")?.remove();
        if (m > rows) {
            setColors(
                colors.concat(
                    Array(m * n - colors.length).fill({ r: 0, g: 0, b: 0 }),
                ),
            );
        } else if (n > columns) {
            const newColors = colors;
            for (let i = 1; i <= m; i++) {
                colors.splice(i * n - 1, 0, { r: 0, g: 0, b: 0 });
            }
            setColors(newColors);
        } else if (m < rows) {
            setColors(colors.slice(0, m * n));
        } else if (n < columns) {
            for (let i = 1; i <= m; i++) {
                colors.splice(i * n, 1);
            }
            setColors(colors);
        }
        if (k + 1 > m * n) {
            setK(m * n - 1);
        }
        setNoOfRows(m);
        setNoOfColumns(n);
    };

    const onColChangeMethod = (color: RGB) => {
        const colorsCopy = [...colors];
        selectedPixels.forEach((el) => {
            colorsCopy[parseInt(el.id, 10)] = color;
        });
        setColors(colorsCopy);
    };

    const onColInitMethod = (event: React.MouseEvent | React.TouchEvent) => {
        if (event.type === "mousedown") event.preventDefault();
        if (event.target instanceof Element) {
            if (event.target.ariaLabel === "Hue") {
                setIsHue(true);
            }
        }
    };

    const onColEndMethod = (event: React.MouseEvent | React.TouchEvent) => {
        event.preventDefault();
        if (isHue) {
            setIsHue(false);
            return;
        }
        selectedPixels.forEach((el) => {
            el.classList.remove("selected");
        });
        setDisplayColPick(false);
    };

    const onCompress = () => {
        const colArray: Array<Array<number>> = colors.map((col) =>
            Object.values(col),
        );
        if (algo === "k-means") {
            setColors(kMeans(colArray, k));
        }
    };

    const onRandomize = () => {
        const randCol: Array<RGB> = [];
        const noOfCols: number = rows * columns;
        for (let i = 0; i < noOfCols; i++) {
            randCol.push({
                r: Math.floor(Math.random() * 255),
                g: Math.floor(Math.random() * 255),
                b: Math.floor(Math.random() * 255),
            });
        }
        document.querySelector(".ds-selector-area")?.remove();
        setColors(randCol);
    };

    const pixelStyle: React.CSSProperties = {
        height: pixelDimensions,
        width: pixelDimensions,
        maxHeight: `calc(${isMobile ? "95vw" : "90vh"} / ${Math.max(
            rows,
            columns,
        )} - 4px)`,
        maxWidth: `calc(${isMobile ? "95vw" : "90vh"} / ${Math.max(
            rows,
            columns,
        )} - 4px)`,
    };

    const portraitStyle: React.CSSProperties = {
        width: colVRow
            ? `${isMobile ? "95vw" : "55vw"}`
            : `calc(${isMobile ? "95vw" : "55vw"} - (${rows - columns} * ${
                  isMobile ? "95vw" : "55vw"
              } / ${rows}))`,
        maxWidth: isMobile ? "95vw" : "90vh",
        maxHeight: isMobile ? "95vw" : "90vh",
    };

    const pixels: Array<JSX.Element> = [];
    let pixelRow: Array<JSX.Element> = [];
    let rowId = 0;

    for (let i = 0; i < columns * rows; i++) {
        pixelRow.push(
            <Pixel
                id={i.toString()}
                key={i}
                innerRef={(el: HTMLDivElement) => {
                    pixelRefs.current[i] = el;
                }}
                color={colors[i]}
                style={pixelStyle}
            />,
        );
        if (pixelRow.length === columns) {
            pixels.push(
                <div className="flex flex-row flex-wrap" key={rowId}>
                    {pixelRow}
                </div>,
            );
            rowId += 1;
            pixelRow = [];
        }
    }

    const optionsK: Array<JSX.Element> = [];
    for (let i = 1; i < Math.min(17, columns * rows); i++) {
        optionsK.push(
            <option value={i} key={i}>
                {i}
            </option>,
        );
    }

    const selectStyle: React.CSSProperties = {
        height: `${(isMobile ? 50 : 20).toString()}%`,
        width: `${(isMobile ? 50 : 100).toString()}%`,
    };

    return (
        <div className="flex items-center justify-evenly m-auto flex-col sm:flex-row mt-[3vh] h-screen-90 w-screen-95">
            <div className="flex flex-wrap relative justify-center content-center h-[calc(90vh-95vw)/2] w-full sm:h-full sm:w-screen-20 sm:float-left">
                <MByNDropdown m={rows} n={columns} mByN={mByN} />
                <select
                    className="text-white bg-zinc-800 cursor-pointer text-center border-2 border-teal-50 rounded-xl font-mono text-3xl w-full"
                    ref={compSelectRef}
                    value={algo}
                    onChange={algoChange}
                    style={selectStyle}
                >
                    <option value="k-means">K-Means</option>
                    <option value="discrete-cosine-transform">
                        Discrete Cosine Transform
                    </option>
                    <option value="fractal-compression">
                        Fractal Compression
                    </option>
                </select>
                {algo === "k-means" ? (
                    <div className="flex items-center w-1/2 h-1/2 sm:w-full sm:h-1/5">
                        <div className="text-white font-mono text-3xl w-fit mr-1 ml-1 sm:ml-0">
                            K:
                        </div>
                        <select
                            className="text-white bg-zinc-800 cursor-pointer text-center border-2 border-teal-50 rounded-xl font-mono text-3xl w-full h-1/2"
                            value={k}
                            onChange={(e) => setK(parseInt(e.target.value, 10))}
                        >
                            {optionsK}
                        </select>
                    </div>
                ) : null}
                <CompressButton onClick={onCompress} title="Compress" />
                <CompressButton
                    onClick={onRandomize}
                    title="Randomize Colors"
                />
            </div>
            <div
                className="flex flex-wrap justify-center"
                ref={targetRef}
                style={portraitStyle}
            >
                {pixels}
                {displayColPick ? (
                    <RgbColorPicker
                        onChange={onColChangeMethod}
                        onMouseDown={onColInitMethod}
                        onTouchStart={onColInitMethod}
                        onMouseUp={onColEndMethod}
                        onTouchEnd={onColEndMethod}
                        color={colAvg}
                    />
                ) : null}
            </div>
        </div>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    return {
        props: {},
    };
};

export default Visualiser;
