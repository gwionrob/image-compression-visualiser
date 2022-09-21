import { DCT, IDCT } from "dct2";
import kmeans from "ml-kmeans";

function kMeans(colors, k) {
    const kmeansGenerator = kmeans(colors, k, {
        initialization: "kmeans++",
        withIterations: true,
    });

    const centroidIterations = [];

    const clusterIterations = [];

    let algoConverged = false;

    while (!algoConverged) {
        const nextIter = kmeansGenerator.next();
        algoConverged = nextIter.value.converged;
        if (
            !algoConverged ||
            (algoConverged && centroidIterations.length === 0)
        ) {
            centroidIterations.push([...nextIter.value.centroids]);
            clusterIterations.push([...nextIter.value.clusters]);
        }
    }

    const finalClusters = clusterIterations[clusterIterations.length - 1];
    const finalCentroids = centroidIterations[centroidIterations.length - 1];

    const newColors = [];

    for (let i = 0; i < finalClusters.length; i++) {
        let newCol = finalCentroids[finalClusters[i]].centroid;
        newCol = newCol.map((p) => Math.round(p));
        newColors.push({
            r: newCol[0],
            g: newCol[1],
            b: newCol[2],
        });
    }

    return newColors;
}

function yCbCrConverter(color) {
    const y = 0.299 * color[0] + 0.587 * color[1] + 0.114 * color[2];
    const Cb = 128 - 0.169 * color[0] - 0.331 * color[1] + 0.5 * color[2];
    const Cr = 128 + 0.5 * color[0] - 0.419 * color[1] - 0.081 * color[2];
    return [y - 128, Cb - 128, Cr - 128];
}

function rgbConverter(color) {
    color = color.map((col) => col + 128);
    const r = color[0] + 1.4 * (color[2] - 128);
    const g = color[0] - 0.343 * (color[1] - 128) - 0.711 * (color[2] - 128);
    const b = color[0] + 1.765 * (color[1] - 128);
    return [Math.round(r), Math.round(g), Math.round(b)];
}

function blocker(pixelValues, rows, columns) {
    const blocks = [...Array((rows * columns) / 64)].map(() => []);
    for (let blockRow = 0; blockRow < rows / 8; blockRow++) {
        let count = 0;
        while (count < 8) {
            for (let blockCol = 0; blockCol < columns / 8; blockCol++) {
                blocks[blockCol + blockRow * (columns / 8)].push(
                    pixelValues.splice(0, 8),
                );
            }
            count++;
        }
    }
    return blocks;
}

function unBlocker(blocks, rows, columns) {
    const pixelValues = [];
    for (let blockRow = 0; blockRow < rows / 8; blockRow++) {
        let count = 0;
        while (count < 8) {
            for (let blockCol = 0; blockCol < columns / 8; blockCol++) {
                pixelValues.push(
                    ...blocks[blockCol + blockRow * (columns / 8)][count],
                );
            }
            count++;
        }
    }
    return pixelValues;
}

function quantize(pixelValues, rows, columns, quality) {
    let quantizationMatrix = [
        16, 11, 10, 16, 24, 40, 51, 61, 12, 12, 14, 19, 26, 58, 60, 55, 14, 13,
        16, 24, 40, 57, 69, 56, 14, 17, 22, 29, 51, 87, 80, 62, 18, 22, 37, 56,
        68, 109, 103, 77, 24, 35, 55, 64, 81, 104, 113, 92, 49, 64, 78, 87, 103,
        121, 120, 101, 72, 92, 95, 98, 112, 100, 103, 99,
    ];
    quantizationMatrix = quantizationMatrix.map((e) => e * (50 / quality));
    const quantization = pixelValues.map((block) => {
        block = block
            .flat()
            .map((e, i) => Math.round(e / quantizationMatrix[i]));
        return blocker(block, 8, 8)[0];
    });
    return quantization.map((block) => {
        block = block
            .flat()
            .map((e, i) => Math.round(e * quantizationMatrix[i]));
        return blocker(block, 8, 8)[0];
    });
}

function pixelValDCT(pixelValues, rows, columns, quality) {
    const blocks = blocker(pixelValues, rows, columns);
    const dct = blocks.map((block) => {
        block = DCT(block);
        return block;
    });
    const quantization = quantize(dct, rows, columns, quality);
    const iDct = quantization.map((block) => {
        block = IDCT(block);
        return block;
    });
    return unBlocker(iDct, rows, columns);
}

function dct(colors, rows, columns, quality) {
    const yPixelValues = [];
    const CbPixelValues = [];
    const CrPixelValues = [];
    colors.forEach((col) => {
        const yCbCr = yCbCrConverter(col);
        yPixelValues.push(yCbCr[0]);
        CbPixelValues.push(yCbCr[1]);
        CrPixelValues.push(yCbCr[2]);
    });
    const yDCT = pixelValDCT(yPixelValues, rows, columns, quality);
    const CbDCT = pixelValDCT(CbPixelValues, rows, columns, quality);
    const CrDCT = pixelValDCT(CrPixelValues, rows, columns, quality);

    const newYCbCrColors = [];
    for (let i = 0; i < yDCT.length; i++) {
        newYCbCrColors.push(rgbConverter([yDCT[i], CbDCT[i], CrDCT[i]]));
    }

    const newColors = [];
    newYCbCrColors.forEach((col) =>
        newColors.push({
            r: col[0],
            g: col[1],
            b: col[2],
        }),
    );
    return newColors;
}

export { kMeans, dct };
