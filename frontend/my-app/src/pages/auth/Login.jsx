import React, { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
function Login() {
  const [form, setform] = useState({
    email: "",
    password: "",
  });
  const [errors, seterrors] = useState([]);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(form);
      navigate("/");
    } catch (error) {
      console.error("Error:", error);
      if (error.errors) {
        seterrors(error.errors.map((e) => e.msg || e));
      } else if (error?.message) {
        seterrors([error.message]);
      } else {
        seterrors("[Request failed]");
      }

      alert(error.errors?.[0]?.msg || error.message || "Request failed");
    }
  };
  const handleChange = (e) => {
    setform({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
      <p className="text-sm text-gray-600 text-center uppercase mb-2 tracking-wide">
        Login to your account
      </p>
      {errors.length > 0 && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded text-sm">
          {errors.map((err, index) => (
            <p key={index}>{err}</p>
          ))}
        </div>
      )}
      {/* Email */}
      <div className="flex flex-col gap-2">
        <label className="text-xs uppercase tracking-wide text-gray-700 font-semibold">
          Email Address
        </label>
        <input
          type="email"
          name="email"
          placeholder="you@example.com"
          onChange={handleChange}
          className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200"
        />
      </div>

      {/* Password */}
      <div className="flex flex-col gap-2">
        <label className="text-xs uppercase tracking-wide text-gray-700 font-semibold">
          Password
        </label>
        <input
          type="password"
          name="password"
          placeholder="••••••••"
          onChange={handleChange}
          className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200"
        />
      </div>

      {/* Forgot */}
      <div className="text-right text-xs text-purple-600 hover:text-purple-800 cursor-pointer font-semibold">
        Forgot password?
      </div>

      {/* Button */}
      <button className="w-full mt-2 bg-purple-600 text-white py-2 rounded-lg font-bold hover:bg-purple-700 transition">
        Login →
      </button>
    </form>
  );
}

export default Login;
