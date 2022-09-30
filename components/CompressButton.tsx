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
            className="flex h-1/3 w-1/2 items-center sm:h-1/5 sm:w-full"
        >
            <button
                id="compressButton"
                className="h-[90%] w-full cursor-pointer rounded-xl border-2 border-teal-50 bg-zinc-800 font-mono text-3xl text-white"
                type="button"
                onClick={onClickHandler}
            >
                {title}
            </button>
        </div>
    );
}

export default CompressButton;
