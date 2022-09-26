import React, { useState, useRef, useEffect } from "react";
import DragSelect from "dragselect";
import { RgbColorPicker } from "react-colorful";
import CompressButton from "../../components/CompressButton";
import MByNDropdown from "../../components/MByNDropdown";
import Pixel from "../../components/Pixel";
import { kMeans, dct } from "../../utilities/algorithms";
import useIsMobile from "../../hooks/useIsMobile";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";

type RGB = { r: number; g: number; b: number };
type DCT = { colors: RGB[]; compRatio: number };

function Visualiser(): JSX.Element {
    const [k, setK] = useState<number>(3);
    const [quality, setQuality] = useState<number>(50);
    const [compRatio, setCompRatio] = useState<string>("0");
    const [isHue, setIsHue] = useState<boolean>(false);
    const [colAvg, setColAvg] = useState<RGB>({ r: 0, g: 0, b: 0 });
    const [displayColPick, setDisplayColPick] = useState<boolean>(false);
    const [pixelMode, setPixelMode] = useState<boolean>(true);
    const [selectedPixels, setSelectedPixels] = useState<Array<HTMLDivElement>>(
        [],
    );
    const compSelectRef = useRef<HTMLSelectElement>(null);
    const isMobile: boolean = useIsMobile();
    const pixelRefs = useRef<Array<HTMLDivElement>>([]);
    const targetRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const { algo } = router.query;
    const [columns, setNoOfColumns] = useState<number>(algo === "dct" ? 8 : 3);
    const [rows, setNoOfRows] = useState<number>(algo === "dct" ? 8 : 3);
    const [colors, setColors] = useState<Array<RGB>>(
        Array(rows * columns).fill({ r: 0, g: 0, b: 0 }),
    );
    const colVRow: boolean = columns >= rows;
    const pixelDimensions: string = `calc((${
        isMobile ? "95vw" : "55vw"
    } / ${(colVRow ? columns : rows).toString()}) - 4px)`;

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
                        selectedColors.push(
                            colArray[parseInt(el.id.slice(5), 10)],
                        );
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
        if (event.target.value === "dct") {
            const m = Math.round(rows / 8) * 8;
            const n = Math.round(columns / 8) * 8;
            mByN(m === 0 ? 8 : m, n === 0 ? 8 : n);
        } else {
            mByN(rows, columns);
        }
        setCompRatio("0");
    };

    const mByN = (m: number, n: number) => {
        if ((m === rows && n === columns) || m * n === 1) return;
        document.querySelector(".ds-selector-area")?.remove();
        if (m != rows) {
            setColors(
                m < rows
                    ? colors.slice(0, m * n)
                    : colors.concat(
                          Array(m * n - colors.length).fill({
                              r: 0,
                              g: 0,
                              b: 0,
                          }),
                      ),
            );
        } else if (n > columns) {
            for (let i = 1; i <= m; i++) {
                colors.splice(i * n - 1, 0, { r: 0, g: 0, b: 0 });
            }
            setColors(colors);
        } else {
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
        setCompRatio("0");
    };

    const onColChangeMethod = (color: RGB) => {
        const colorsCopy = [...colors];
        selectedPixels.forEach((el) => {
            colorsCopy[parseInt(el.id.slice(5), 10)] = color;
        });
        setColors(colorsCopy);
        setCompRatio("0");
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
        if (algo === "dct") {
            const dctVals: DCT = dct(colArray, rows, columns, quality);
            setColors(dctVals.colors);
            setCompRatio(dctVals.compRatio.toPrecision(3));
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
        setCompRatio("0");
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

    const containerStyle: React.CSSProperties = {
        width: isMobile ? "95vw" : "90vh",
        height: isMobile ? "95vw" : "90vh",
    };

    const portraitStyle: React.CSSProperties = {
        width: colVRow
            ? `${isMobile ? "95vw" : "55vw"}`
            : `calc(${isMobile ? "95vw" : "55vw"} - (${rows - columns} * ${
                  isMobile ? "95vw" : "55vw"
              } / ${rows}))`,
    };

    const pixels: Array<JSX.Element> = [];
    let pixelRow: Array<JSX.Element> = [];
    let rowId = 0;

    for (let i = 0; i < columns * rows; i++) {
        pixelRow.push(
            <Pixel
                id={`pixel${i.toString()}`}
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
                <div
                    id="pixelRow"
                    className="flex flex-row flex-wrap"
                    key={rowId}
                >
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

    return (
        <div
            id="visualiser"
            className="flex items-center justify-evenly m-auto flex-col sm:flex-row h-screen-90 w-screen-95"
        >
            <div
                id="visualiserMenu"
                className="flex flex-wrap relative justify-center content-center h-[calc(100vh-7.5vh-95vw)] w-full sm:h-full sm:w-screen-20 sm:float-left"
            >
                <MByNDropdown m={rows} n={columns} mByN={mByN} algo={algo} />
                <div
                    id="algoSelectContainer"
                    className="flex items-center w-1/2 h-1/3 sm:w-full sm:h-1/5"
                >
                    <select
                        id="algoSelect"
                        className="text-white bg-zinc-800 cursor-pointer text-center border-2 border-teal-50 rounded-xl font-mono text-3xl w-full h-[90%]"
                        ref={compSelectRef}
                        value={algo}
                        onChange={algoChange}
                    >
                        <option value="k-means">K-Means</option>
                        <option value="dct">Discrete Cosine Transform</option>
                        <option value="fractal-compression">
                            Fractal Compression
                        </option>
                    </select>
                </div>
                {algo === "k-means" ? (
                    <div
                        id="kSelectContainer"
                        className="flex items-center w-1/2 h-1/3 sm:w-full sm:h-1/5"
                    >
                        <div
                            id="kSelectTitle"
                            className="text-white font-mono text-3xl w-fit mr-1 ml-1 sm:ml-0"
                        >
                            K:
                        </div>
                        <select
                            id="kSelect"
                            className="text-white bg-zinc-800 cursor-pointer text-center border-2 border-teal-50 rounded-xl font-mono text-3xl w-full h-1/2"
                            value={k}
                            onChange={(e) => setK(parseInt(e.target.value, 10))}
                        >
                            {optionsK}
                        </select>
                    </div>
                ) : algo === "dct" ? (
                    <div
                        id="dctQualitySliderContainer"
                        className="flex flex-col items-center justify-evenly w-1/2 h-1/3 sm:w-full sm:h-1/5"
                    >
                        <div
                            id="kSelectTitle"
                            className="text-white font-mono text-3xl w-fit mr-1 ml-1 sm:ml-0"
                        >
                            {`Quality: ${quality}`}
                        </div>
                        <input
                            id="dctQualitySlider"
                            type="range"
                            min="1"
                            max="100"
                            value={quality}
                            onChange={(e) =>
                                setQuality(parseInt(e.target.value, 10))
                            }
                            className="w-[90%] h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                        ></input>
                    </div>
                ) : null}
                <CompressButton
                    onClick={onCompress}
                    title={
                        compRatio !== "0"
                            ? `Compression Ratio: ${compRatio.toString()}`
                            : "Compress"
                    }
                />
                <CompressButton
                    onClick={onRandomize}
                    title="Randomize Colors"
                />
            </div>
            {pixelMode ? (
                <div
                    id="portraitContainer"
                    className="flex flex-col items-center justify-center"
                    style={containerStyle}
                >
                    <div
                        id="portrait"
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
            ) : (
                <div></div>
            )}
        </div>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    return {
        props: {},
    };
};

export default Visualiser;
