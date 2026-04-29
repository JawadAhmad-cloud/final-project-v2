import { useState } from "react";
import Login from "./Login";
import Register from "./Register";
// import Login from "./auth/Login";
// import Register from "./auth/Register";

export default function AuthPage() {
  const [mode, setMode] = useState("login");

  const tabs = ["login", "signup"];

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#07080F] text-[#F0F1FF]">

      <div className="w-[420px] bg-[#0F1018] border border-[#2C2D42] rounded-[18px] p-9">

        {/* Heading */}
        <h2 className="text-[26px] font-extrabold text-[#FF5533] text-center">
          ShopFlow
        </h2>

        <p className="text-[10px] tracking-[2px] text-[#454666] text-center uppercase mt-1 mb-6">
          {mode === "login"
            ? "Sign in to your account"
            : "Create your account"}
        </p>

        {/* Buttons (MAP) */}
        <div className="flex bg-[#15161F] rounded-md p-[3px] mb-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setMode(tab)}
              className={`flex-1 py-[7px] text-[12.5px] rounded-md capitalize ${
                mode === tab
                  ? "bg-[#FF5533] text-white"
                  : "text-[#454666]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* CONDITIONAL RENDER */}
        {mode === "login" ? <Login/> : < Register/>}
      </div>
    </div>
  );
}