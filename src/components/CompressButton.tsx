import React from "react";
import useIsMobile from "../hooks/useIsMobile";

type Props = {
    onClick: Function;
    title: string;
};

function CompressButton({ onClick, title }: Props): JSX.Element {
    const isMobile: boolean = useIsMobile();

    const onClickHandler = () => {
        onClick();
    };

    const style: React.CSSProperties = {
        height: `${(isMobile ? 50 : 20).toString()}%`,
        width: `${(isMobile ? 50 : 100).toString()}%`,
    };

    return (
        <button type="button" onClick={onClickHandler} style={style}>
            {title}
        </button>
    );
}

export default CompressButton;
