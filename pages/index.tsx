import React from "react";
import Visualiser from "./[algo]";

type Props = { imageView: boolean };

function Home({ imageView }: Props): JSX.Element {
    return <Visualiser imageView={imageView}></Visualiser>;
}

export default Home;
