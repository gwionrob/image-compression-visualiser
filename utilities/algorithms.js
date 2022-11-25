import { DCT, IDCT } from "dct2";
import kmeans from "ml-kmeans";

function clustersMatchPerc(prevClusters, clusters) {
    if (prevClusters === []) return 0;
    const matches = clusters.filter((cluster, i) => {
        return cluster === prevClusters[i];
    }).length;
    return (matches / clusters.length) * 100;
}

function kMeans(colors, k, imageView) {
    const kmeansVals = kmeans(colors, k, {
        initialization: "kmeans++",
    });

    const finalClusters = kmeansVals.clusters;
    const finalCentroids = kmeansVals.centroids;

    const newColors = [];

    for (let i = 0; i < finalClusters.length; i++) {
        let newCol = finalCentroids[finalClusters[i]].centroid;
        newCol = newCol.map((p) => Math.round(p));
        if (imageView) {
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

    return newColors;
}

function kMeansGenerator(colors, k) {
    return kmeans(colors, k, {
        initialization: "kmeans++",
        maxIterations: 500,
    });
}

function kMeansStep(kMeansGen, currentIter) {
    const algoConverged = currentIter.value.converged;
    const prevClusters = [...currentIter.value.clusters];

    if (!algoConverged) {
        const nextIter = kMeansGen.next();
        const perc = clustersMatchPerc(prevClusters, nextIter.value.clusters);
        const scaledPerc = Math.max((perc - 99) * 100, 0);
        return { currentIter: nextIter, perc: scaledPerc };
    } else {
        return { currentIter: currentIter, perc: 100 };
    }
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
    quantizationMatrix = quantizationMatrix.map(
        (e) => e * ((100 - quality) / 50),
    );
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
    const zeros = quantization.flat(2).filter((a) => a === 0).length;
    const iDct = quantization.map((block) => {
        block = IDCT(block);
        return block;
    });
    return [unBlocker(iDct, rows, columns), zeros];
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
    for (let i = 0; i < yDCT[0].length; i++) {
        newYCbCrColors.push(
            rgbConverter([yDCT[0][i], CbDCT[0][i], CrDCT[0][i]]),
        );
    }

    const newColors = [];
    newYCbCrColors.forEach((col) =>
        newColors.push({
            r: col[0],
            g: col[1],
            b: col[2],
        }),
    );
    const compRatio =
        1 - (yDCT[1] + CbDCT[1] + CrDCT[1]) / (3 * rows * columns);
    return { colors: newColors, compRatio: compRatio };
}

export { kMeans, kMeansGenerator, kMeansStep, dct };
