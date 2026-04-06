import Image from "next/image";
import React from "react";

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Animated Logo/Icon */}
        <div className="relative w-16 h-[40px]">
          {/* Inner pulsing circle */}
          <div className="absolute inset-2 bg-white rounded-full animate-pulse flex items-center justify-center">
            <Image
              src={"/smallLogo.png"}
              alt=""
              width={50}
              height={50}
              className="h-[50px] w-auto"
            />
          </div>
        </div>

        {/* Loading text */}
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-xl font-semibold text-gray-800">Woven Art</h2>
          <div className="flex gap-1 mt-1">
            <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
