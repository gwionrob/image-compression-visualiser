import {
    kMeans,
    kMeansGenerator,
    kMeansStep,
    dct,
} from "./utilities/algorithms";

type RGB = { r: number; g: number; b: number };
type preProssesedImage = {
    algo: string;
    isImage: boolean;
    imageData: Array<number>;
    colorData: Array<RGB>;
    k: number;
    rows: number;
    columns: number;
    quality: number;
};

addEventListener("message", (event: MessageEvent<preProssesedImage>) => {
    const algo = event.data.algo;
    const isImage = event.data.isImage;
    const k = event.data.k;
    const rows = event.data.rows;
    const columns = event.data.columns;
    const quality = event.data.quality;
    const imageData = new Uint8ClampedArray(event.data.imageData);
    const colorData = event.data.colorData;
    const colArray: Array<Array<number>> = [];
    if (algo === "k-means") {
        if (isImage) {
            for (let i = 0; i < imageData.length; i += 4) {
                const newCol: Array<number> = [];
                newCol.push(imageData[i]);
                newCol.push(imageData[i + 1]);
                newCol.push(imageData[i + 2]);
                colArray.push(newCol);
            }
            const generator = kMeansGenerator(colArray, k);

            const finalClusters = generator.clusters;
            const finalCentroids = generator.centroids;
            const newColors = [];

            for (let i = 0; i < finalClusters.length; i++) {
                let newCol = finalCentroids[finalClusters[i]].centroid;
                newCol = newCol.map((p: number) => Math.round(p));
                if (isImage) {
                    newColors.push(newCol[0]);
                    newColors.push(newCol[1]);
                    newColors.push(newCol[2]);
                    newColors.push(255);
                } else {
                    newColors.push({
                        r: newCol[0],
                        g: newCol[1],
                        b: newCol[2],
                    });
                }
            }

            postMessage({
                algo: algo,
                imageData: newColors,
                imageView: isImage,
            });
        } else {
            const colArray: Array<Array<number>> = colorData.map((col) =>
                Object.values(col),
            );
            postMessage({
                algo: algo,
                kmeansData: kMeans(colArray, k, isImage),
                imageView: isImage,
            });
        }
    } else if (algo === "dct") {
        if (isImage) {
            postMessage({
                algo: algo,
                dctData: [],
                imageView: isImage,
            });
        } else {
            const colArray: Array<Array<number>> = colorData.map((col) =>
                Object.values(col),
            );
            postMessage({
                algo: algo,
                dctData: dct(colArray, rows, columns, quality),
                imageView: isImage,
            });
        }
    }
});
