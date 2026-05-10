import React, { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, seterror] = useState([]);
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    seterror([]);

    try {
      const res = await register(form);

      if (res?.data?.verificationRequired) {
        navigate("/verify-email"); // Navigate to verify email page
      }
    } catch (error) {
      console.error("Error:", error);

      if (error?.errors) {
        seterror(error.errors.map((e) => e.msg || e));
      } else if (error?.message) {
        seterror([error.message]);
      } else {
        seterror(["Request failed"]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
      <p className="text-sm text-gray-600 text-center uppercase mb-2 tracking-wide">
        Create your account
      </p>
      {error.length > 0 && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded text-sm">
          {error.map((err, index) => (
            <p key={index}>{err}</p>
          ))}
        </div>
      )}
      <input
        type="text"
        name="username"
        required
        placeholder="Username"
        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200"
        onChange={handleChange}
      />

      <input
        type="email"
        name="email"
        required
        placeholder="Email"
        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200"
        onChange={handleChange}
      />

      <input
        type="password"
        name="password"
        required
        placeholder="Min 6 chars, 1 uppercase, 1 lowercase, 1 number"
        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200"
        onChange={handleChange}
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 font-bold transition"
      >
        {loading ? "Registering..." : "Register"}
      </button>
    </form>
  );
}

export default Register;
