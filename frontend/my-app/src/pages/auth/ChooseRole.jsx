import React from 'react'
import { useContext } from 'react';
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext';
function ChooseRole() {

  const [role, setRole] = useState("");
  const navigate = useNavigate();
const {setRoleApi}=useContext(AuthContext)
  const handleSubmit = async () => {
  if (!role) return alert("Please select a role");

  try {
    const res = await setRoleApi(role);

    if (res.success) {
      const userRole = res.data.role;

      if (userRole === "seller") {
        navigate("/seller/dashboard");
      } else if (userRole === "user") {
        navigate("/user/dashboard");
      }
    } else {
      alert(res.message || "Failed to set the role");
    }

  } catch (error) {
    console.error("Error:", error);
    alert(error.message || "Failed to set the role");
  }
};

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#07080F] text-white">
      <div className="w-[400px] bg-[#0F1018] p-6 rounded-xl border border-[#2C2D42]">
        <h2 className="text-xl font-bold mb-4 text-center">
          Choose Your Role
        </h2>

        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="user"
              checked={role === "user"}
              onChange={(e) => setRole(e.target.value)}
            />
            User
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="seller"
              checked={role === "seller"}
              onChange={(e) => setRole(e.target.value)}
            />
            Seller
          </label>

          <button
            onClick={handleSubmit}
            className="bg-blue-500 p-2 rounded mt-4"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChooseRole