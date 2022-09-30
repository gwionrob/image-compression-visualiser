import {
    kMeans,
    kMeansGenerator,
    kMeansStep,
    dct,
} from "./utilities/algorithms";

type preProssesedImage = {
    algo: string;
    colArray: Array<number>;
    image: boolean;
    k: number;
};

addEventListener("message", (event: MessageEvent<preProssesedImage>) => {
    const algo = event.data.algo;
    const colArray = event.data.colArray;
    const image = event.data.image;
    const k = event.data.k;
    if (algo === "k-means") {
        if (image) {
            const generator = kMeansGenerator(colArray, k);
            let step = kMeansStep(generator, generator.next());

            while (step.perc !== 100) {
                postMessage({
                    perc: step.perc,
                });
                step = kMeansStep(generator, step.currentIter);
            }
            const finalClusters = step.currentIter.value.clusters;
            const finalCentroids = step.currentIter.value.centroids;

            const newColors = [];

            for (let i = 0; i < finalClusters.length; i++) {
                let newCol = finalCentroids[finalClusters[i]].centroid;
                newCol = newCol.map((p: number) => Math.round(p));
                if (image) {
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
                imageView: image,
            });
        } else {
            postMessage({
                algo: algo,
                pixelData: kMeans(colArray, k, image),
                imageView: image,
            });
        }
    } else if (algo === "dct") {
    }
});
