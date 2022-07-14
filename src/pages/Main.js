import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./Home";
import KMeans from "./KMeans";
import DCC from "./DCC";
import FractalComp from "./FractalComp";

const Main = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />

            <Route path="/img-compression-visualiser" element={<Home />} />

            <Route
                path="/img-compression-visualiser/discrete-cosine-transform"
                element={<DCC />}
            />

            <Route
                path="/img-compression-visualiser/fractal-compression"
                element={<FractalComp />}
            />

            <Route
                path="/img-compression-visualiser/k-means"
                element={<KMeans />}
            />
        </Routes>
    );
};

export default Main;
