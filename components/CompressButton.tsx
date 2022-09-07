import React from "react";

type Props = {
    onClick: Function;
    title: string;
};

function CompressButton({ onClick, title }: Props): JSX.Element {
    const onClickHandler = () => {
        onClick();
    };

    return (
        <div
            id="buttonContainer"
            className="flex items-center w-1/2 h-1/3 sm:w-full sm:h-1/5"
        >
            <button
                id="compressButton"
                className="text-white bg-zinc-800 cursor-pointer border-2 border-teal-50 rounded-xl font-mono text-3xl w-full h-[90%]"
                type="button"
                onClick={onClickHandler}
            >
                {title}
            </button>
        </div>
    );
}

export default CompressButton;
