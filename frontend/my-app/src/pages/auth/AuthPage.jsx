import { useState } from "react";
import Login from "./Login";
import Register from "./Register";
// import Login from "./auth/Login";
// import Register from "./auth/Register";

import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const navigate = useNavigate();

  const tabs = ["login", "signup"];

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white">
      <div className="w-[420px] bg-white border border-gray-300 rounded-lg p-9 shadow-lg">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-800 mb-4 font-semibold"
        >
          <FaArrowLeft />
          Back to Home
        </button>
        {/* Heading */}
        <h2 className="text-[26px] font-extrabold text-purple-600 text-center">
          ShopFlow
        </h2>

        <p className="text-sm text-gray-600 text-center uppercase mt-3 mb-6 tracking-wide">
          {mode === "login" ? "Sign in to your account" : "Create your account"}
        </p>

        {/* Buttons (MAP) */}
        <div className="flex bg-gray-100 rounded-md p-1 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setMode(tab)}
              className={`flex-1 py-2 text-sm rounded-md capitalize font-semibold transition ${
                mode === tab
                  ? "bg-purple-600 text-white"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* CONDITIONAL RENDER */}
        {mode === "login" ? <Login /> : <Register />}
      </div>
    </div>
  );
}
