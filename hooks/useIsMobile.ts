import { useState, useEffect } from "react";

export default function useIsMobile(): boolean {
    const [isMobile, setIsMobile] = useState<boolean>();

    useEffect(() => {
        const { innerWidth: currentWidth } = window;
        setIsMobile(currentWidth < 640);
        
        function handleResize() {
            const { innerWidth: width } = window;
            setIsMobile(width < 640);
        }

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return isMobile !== undefined ? isMobile : false;
}
