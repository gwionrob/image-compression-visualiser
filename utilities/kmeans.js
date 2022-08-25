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

export default kMeans;
