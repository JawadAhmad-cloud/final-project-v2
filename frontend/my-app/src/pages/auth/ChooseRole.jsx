import React from "react";
import { useContext } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { FaArrowLeft } from "react-icons/fa";

function ChooseRole() {
  const [role, setRole] = useState("");
  const navigate = useNavigate();
  const { setRoleApi } = useContext(AuthContext);
  const handleSubmit = async () => {
    if (!role) return alert("Please select a role");
    try {
      const user = await setRoleApi(role);

      if (user) {
        navigate("/profile-complete");
      }
    } catch (error) {
      console.error("Error:", error);
      alert(error?.message || "Failed to set the role");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-[400px] bg-white p-8 rounded-lg border border-gray-300 shadow-lg">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-800 mb-6 font-semibold"
        >
          <FaArrowLeft />
          Back to Home
        </button>
        <h2 className="text-3xl font-bold mb-2 text-center text-gray-800">
          Choose Your Role
        </h2>
        <p className="text-gray-600 text-center mb-8 text-sm">
          Select whether you want to shop or sell
        </p>

        <div className="flex flex-col gap-4">
          <label className="flex items-center gap-4 p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-purple-600 hover:bg-purple-50 transition">
            <input
              type="radio"
              value="user"
              checked={role === "user"}
              onChange={(e) => setRole(e.target.value)}
              className="w-5 h-5 text-purple-600 cursor-pointer"
            />
            <div>
              <p className="font-semibold text-gray-800">Shopper</p>
              <p className="text-sm text-gray-600">Browse and buy products</p>
            </div>
          </label>

          <label className="flex items-center gap-4 p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-purple-600 hover:bg-purple-50 transition">
            <input
              type="radio"
              value="seller"
              checked={role === "seller"}
              onChange={(e) => setRole(e.target.value)}
              className="w-5 h-5 text-purple-600 cursor-pointer"
            />
            <div>
              <p className="font-semibold text-gray-800">Seller</p>
              <p className="text-sm text-gray-600">Sell your products</p>
            </div>
          </label>

          <button
            type="button"
            onClick={handleSubmit}
            className="bg-purple-600 text-white p-3 rounded-lg mt-6 font-bold hover:bg-purple-700 transition"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChooseRole;
