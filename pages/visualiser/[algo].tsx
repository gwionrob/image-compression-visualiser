import React, {
    useState,
    useRef,
    useEffect,
    DragEvent,
    ChangeEvent,
} from "react";
import DragSelect from "dragselect";
import { RgbColorPicker } from "react-colorful";
import CompressButton from "../../components/CompressButton";
import MByNDropdown from "../../components/MByNDropdown";
import Pixel from "../../components/Pixel";
import { kMeans, dct } from "../../utilities/algorithms";
import useIsMobile from "../../hooks/useIsMobile";
import uploadImg from "../../public/upload-image.png";
import NextImage from "next/image";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";

type RGB = { r: number; g: number; b: number };
type DCT = { colors: RGB[]; compRatio: number };
type Props = { imageView: boolean };
type workerResponse = {
    algo: string;
    imageData: Array<number>;
    pixelData: Array<RGB>;
    imageView: boolean;
    perc: number;
};

function copyImageData(ctx: CanvasRenderingContext2D, src: ImageData) {
    let imgData = ctx.createImageData(src.width, src.height);
    imgData.data.set(src.data);
    return imgData;
}

function Visualiser({ imageView }: Props): JSX.Element {
    const [k, setK] = useState<number>(3);
    const [quality, setQuality] = useState<number>(50);
    const [compRatio, setCompRatio] = useState<string>("0");
    const [isHue, setIsHue] = useState<boolean>(false);
    const [colAvg, setColAvg] = useState<RGB>({ r: 0, g: 0, b: 0 });
    const [compressed, setCompressed] = useState<boolean>(false);
    const [displayColPick, setDisplayColPick] = useState<boolean>(false);
    const [showOriginal, setShowOriginal] = useState<boolean>(true);
    const [selectedPixels, setSelectedPixels] = useState<Array<HTMLDivElement>>(
        [],
    );
    const compSelectRef = useRef<HTMLSelectElement>(null);
    const isMobile: boolean = useIsMobile();
    const pixelRefs = useRef<Array<HTMLDivElement>>([]);
    const imageRef = useRef<HTMLCanvasElement>(null);
    const targetRef = useRef<HTMLDivElement>(null);
    const inputImageButtonRef = useRef<HTMLButtonElement>(null);
    const inputImageRef = useRef<HTMLInputElement>(null);
    const workerRef = useRef<Worker>();
    const router = useRouter();
    const { algo } = router.query;
    const [columns, setNoOfColumns] = useState<number>(algo === "dct" ? 8 : 3);
    const [rows, setNoOfRows] = useState<number>(algo === "dct" ? 8 : 3);
    const [colors, setColors] = useState<Array<RGB>>(
        Array(rows * columns).fill({ r: 0, g: 0, b: 0 }),
    );
    const [compressedImage, setCompressedImage] = useState<ImageData>();
    const [image, setImage] = useState<ImageData>();
    const [originalImage, setOriginalImage] = useState<ImageData>();
    const colVRow: boolean = columns >= rows;
    const pixelDimensions: string = `calc((${
        isMobile ? "95vw" : "55vw"
    } / ${(colVRow ? columns : rows).toString()}) - 4px)`;

    const readImage = (file: File) => {
        if (file === undefined) return;
        if (file.type.slice(0, 6) !== "image/") {
            alert("Please input an image.");
        }
        const reader = new FileReader();
        reader.addEventListener("load", (event) => {
            let img = new Image();
            img.addEventListener("load", () => {
                if (imageRef.current === null) return;
                imageRef.current.width = img.width;
                imageRef.current.height = img.height;
                const context = imageRef.current.getContext("2d");
                if (context === null) return;
                context.drawImage(img, 0, 0);
                const image = context.getImageData(0, 0, img.width, img.height);
                setImage(image);
                setCompressed(false);
                setCompressedImage(undefined);
                setOriginalImage(copyImageData(context, image));
            });
            if (
                event.target === null ||
                typeof event.target.result !== "string"
            )
                return;
            img.src = event.target.result;
        });
        reader.readAsDataURL(file);
    };

    useEffect(() => {
        workerRef.current = new Worker(
            new URL("../../worker.ts", import.meta.url),
        );
        workerRef.current.onmessage = (event: MessageEvent<workerResponse>) => {
            const progressBarContainer =
                document.getElementById("imgCompProgress");
            const progressBar = document.getElementById("myBar");
            if (event.data.perc) {
                if (progressBar)
                    progressBar.style.height = event.data.perc.toString() + "%";
                return;
            }
            if (event.data.algo === "k-means") {
                const imageArray = event.data.imageData;
                const pixelArray = event.data.pixelData;
                if (event.data.imageView) {
                    let imageData: Uint8ClampedArray =
                        Uint8ClampedArray.from(imageArray);
                    if (image === undefined) return;
                    image.data.set(imageData);
                    const context = imageRef.current?.getContext("2d");
                    if (!context) return;
                    context.putImageData(image, 0, 0);
                    if (progressBarContainer && progressBar) {
                        progressBarContainer.style.display = "none";
                        progressBar.style.height = "0%";
                    }
                    setCompressed(true);
                    setCompressedImage(copyImageData(context, image));
                } else {
                    setColors(pixelArray);
                }
            }
        };
        return () => {
            if (workerRef.current) workerRef.current.terminate();
        };
    }, [image]);

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
                    setColAvg(kMeans(selectedColors, 1, false)[0]);
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
        const colArray: Array<Array<number>> = [];
        if (imageView) {
            const progressBar = document.getElementById("imgCompProgress");
            if (progressBar !== null) {
                progressBar.style.display = "block";
            }
            if (image === undefined) return;
            if (algo === "k-means") {
                if (workerRef.current === undefined) return;
                workerRef.current.postMessage({
                    algo: algo,
                    imageData: image.data,
                    isImage: imageView,
                    k: k,
                });
            }
            if (algo === "dct") {
                const dctVals: DCT = dct(colArray, rows, columns, quality);
                setColors(dctVals.colors);
                setCompRatio(dctVals.compRatio.toPrecision(3));
            }
        } else {
            if (algo === "k-means") {
                if (workerRef.current === undefined) return;
                workerRef.current.postMessage({
                    algo: algo,
                    imageData: colors,
                    isImage: imageView,
                    k: k,
                });
            }
            if (algo === "dct") {
                const dctVals: DCT = dct(colArray, rows, columns, quality);
                setColors(dctVals.colors);
                setCompRatio(dctVals.compRatio.toPrecision(3));
            }
        }
        setShowOriginal(true);
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

    const onOriginalImage = () => {
        if (imageRef.current === null) return;
        const context = imageRef.current.getContext("2d");
        if (
            image === undefined ||
            context === null ||
            originalImage === undefined ||
            compressedImage === undefined
        )
            return;
        context.putImageData(
            showOriginal ? originalImage : compressedImage,
            0,
            0,
        );
        setImage(copyImageData(context, originalImage));
        setShowOriginal(!showOriginal);
    };

    const onCanvasClick = () => {
        if (inputImageButtonRef.current === null) return;
        inputImageButtonRef.current.click();
    };

    const onImageDrag = (event: DragEvent) => {
        event.stopPropagation();
        event.preventDefault();
        // Style the drag-and-drop as a "copy file" operation.
        if (event.dataTransfer === null) return;
        event.dataTransfer.dropEffect = "copy";
    };

    const onImageDrop = (event: DragEvent) => {
        event.stopPropagation();
        event.preventDefault();
        if (event.dataTransfer === null) return;
        const fileList = event.dataTransfer.files;

        readImage(fileList[0]);
    };

    const onImageClick = () => {
        if (inputImageRef.current === null) return;
        inputImageRef.current.click();
    };

    const onImageInput = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files === null) return;
        const fileList = event.target.files;
        readImage(fileList[0]);
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

    const imageStyle: React.CSSProperties = {
        width: `${isMobile ? "95vw" : "55vw"}`,
        height: `${isMobile ? "95vw" : "55vw"}`,
        maxWidth: "90vh",
        maxHeight: "90vh",
    };

    const preImageDisplayStyle: React.CSSProperties = {
        width: `${isMobile ? "95vw" : "55vw"}`,
        maxWidth: "90vh",
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
    for (let i = 1; i < (imageView ? 65 : Math.min(17, columns * rows)); i++) {
        optionsK.push(
            <option value={i} key={i}>
                {i}
            </option>,
        );
    }

    return (
        <div
            id="visualiser"
            className="m-auto flex h-screen-90 w-screen-95 flex-col items-center justify-evenly sm:flex-row"
        >
            <div
                id="visualiserMenu"
                className="relative flex h-[calc(100vh-7.5vh-95vw)] w-full flex-wrap content-center justify-center sm:float-left sm:h-full sm:w-screen-20"
            >
                {imageView ? null : (
                    <MByNDropdown
                        m={rows}
                        n={columns}
                        mByN={mByN}
                        algo={algo}
                    />
                )}
                <div
                    id="algoSelectContainer"
                    className="flex h-1/3 w-1/2 items-center sm:h-1/5 sm:w-full"
                >
                    <select
                        id="algoSelect"
                        className="h-[90%] w-full cursor-pointer rounded-xl border-2 border-teal-50 bg-zinc-800 text-center font-mono text-3xl text-white"
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
                        className="flex h-1/3 w-1/2 items-center sm:h-1/5 sm:w-full"
                    >
                        <div
                            id="kSelectTitle"
                            className="mr-1 ml-1 w-fit font-mono text-3xl text-white sm:ml-0"
                        >
                            K:
                        </div>
                        <select
                            id="kSelect"
                            className="h-1/2 w-full cursor-pointer rounded-xl border-2 border-teal-50 bg-zinc-800 text-center font-mono text-3xl text-white"
                            value={k}
                            onChange={(e) => setK(parseInt(e.target.value, 10))}
                        >
                            {optionsK}
                        </select>
                    </div>
                ) : algo === "dct" ? (
                    <div
                        id="dctQualitySliderContainer"
                        className="flex h-1/3 w-1/2 flex-col items-center justify-evenly sm:h-1/5 sm:w-full"
                    >
                        <div
                            id="kSelectTitle"
                            className="mr-1 ml-1 w-fit font-mono text-3xl text-white sm:ml-0"
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
                            className="h-2 w-[90%] cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
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
                {imageView ? (
                    compressed ? (
                        <CompressButton
                            onClick={onOriginalImage}
                            title={
                                showOriginal
                                    ? "Original Image"
                                    : "Compressed Image"
                            }
                        />
                    ) : null
                ) : (
                    <CompressButton
                        onClick={onRandomize}
                        title="Randomize Colors"
                    />
                )}
            </div>
            {imageView ? (
                <div
                    id="imageContainer"
                    className="flex flex-col items-center justify-center"
                    style={containerStyle}
                >
                    <input
                        id="imageInput"
                        type="file"
                        className="hidden"
                        ref={inputImageRef}
                        onChangeCapture={onImageInput}
                        accept="image/*"
                    ></input>
                    <button
                        onClick={onImageClick}
                        ref={inputImageButtonRef}
                        className="hidden"
                    ></button>
                    <canvas
                        id="image"
                        className="absolute cursor-pointer overflow-hidden rounded-xl border-2 border-teal-50 bg-cover"
                        style={imageStyle}
                        ref={imageRef}
                        onClick={onCanvasClick}
                        onDragOver={onImageDrag}
                        onDrop={onImageDrop}
                    ></canvas>
                    {image ? null : (
                        <div
                            id="pre-image-upload-display"
                            className="absolute z-10 flex cursor-pointer flex-col items-center"
                            onClick={onCanvasClick}
                            style={preImageDisplayStyle}
                        >
                            <div
                                id="upload-image-wrapper"
                                className="h-1/4 w-1/4"
                            >
                                <NextImage
                                    layout="responsive"
                                    src={uploadImg}
                                    alt="uploadImg button icon"
                                />
                            </div>
                            <p className="w-full text-center font-mono text-3xl text-white">
                                {isMobile
                                    ? "Tap here to upload image:"
                                    : "Drag and Drop or click here to upload image:"}
                            </p>
                        </div>
                    )}
                </div>
            ) : (
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
            )}
            {imageView ? (
                <div
                    id="imgCompProgress"
                    className="relative hidden h-1/5 w-full overflow-hidden rounded-xl border-2 border-teal-50 sm:h-full sm:w-screen-5"
                >
                    <div
                        id="myBar"
                        className="absolute bottom-0 h-[0%] w-full bg-green-300 transition-all"
                    ></div>
                </div>
            ) : null}
        </div>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    return {
        props: {},
    };
};

export default Visualiser;
