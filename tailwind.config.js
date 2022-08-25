/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            height: (theme) => ({
                "screen-90": "90vh",
                "screen-7.5": "7.5vh",
                "screen-5": "5vh",
                "screen-3": "3vh",
            }),
            width: (theme) => ({
                "screen-95": "95vw",
                "screen-55": "55vw",
                "screen-90": "50vw",
                "screen-20": "20vw",
                "screen-5": "5vw",
            }),
        },
    },
    plugins: [],
};
