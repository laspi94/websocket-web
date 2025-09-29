import React, { useEffect, useState } from "react";

const Loader: React.FC<{ onFinish?: () => void }> = ({ onFinish }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        console.log("🎮 Initializing Index Page Manager...");

        const timer = setTimeout(() => {
            hideLoader();
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    const hideLoader = () => {
        setVisible(false);
        console.log("✅ Loader hidden");
        if (onFinish) {
            setTimeout(() => onFinish(), 300); // espera un poquito para transición
        }
    };

    return (
        <div className={`loading-overlay ${visible ? "visible" : "hidden"}`}>
            <div className="loader"></div>
        </div>
    );
};

export default Loader;
