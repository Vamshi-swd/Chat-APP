import { useState, useEffect } from "react";
import { FcGoogle } from "react-icons/fc";

export default function GoogleSignIn({ onSignIn }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      {/* Login Box */}
      <div
        className={`transition-all duration-[600ms] transform ${
          isVisible ? "opacity-100 scale-[1] translate-y-[0px]" : "opacity-0 scale-[0.95] translate-y-[10px]"
        } flex flex-col items-center p-[32px] space-y-[24px] bg-white border border-[rgba(0,0,0,0.2)] shadow-[0px_4px_20px_rgba(0,0,0,0.2)] rounded-[20px] w-[380px]`}
      >
        {/* Title */}
        <h1 className="text-[28px] font-extrabold tracking-wide text-gray-900">
          Welcome to <span className="text-[#128C7E]">Chat App</span>
        </h1>

        {/* Google Sign-In Button */}
        <button
          onClick={onSignIn}
          className="flex items-center gap-[12px] px-[28px] py-[14px] text-[18px] font-semibold text-white bg-gradient-to-r from-[#34a853] to-[#1e7e34] rounded-[50px] shadow-[0px_4px_12px_rgba(52,168,83,0.5)] hover:scale-[1.05] hover:shadow-[0px_6px_16px_rgba(30,126,52,0.6)] transition-transform duration-[300ms]"
        >
          <FcGoogle className="text-[32px]" />
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
