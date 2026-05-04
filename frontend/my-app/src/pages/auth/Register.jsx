import React, { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
const [error, seterror] = useState([])
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

    if (res?.data?.roleRequired) {
      navigate("/role"); // correct
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
    <div className="flex items-center justify-center bg-[#07080F] text-[#F0F1FF]">
      <form
        onSubmit={handleSubmit}
        className="w-[420px] bg-[#0F1018] border border-[#2C2D42] rounded-[18px] px-9 py-9 flex flex-col gap-[14px]"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          Create Account
        </h2>
         {error.length > 0 && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded text-sm">
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
          className="w-full bg-[#15161F] border border-[#2C2D42] rounded-[8px] px-[12px] py-[10px] text-[13px] outline-none focus:border-[#FF5533]"
          onChange={handleChange}
        />

        <input
          type="email"
          name="email"
          required
          placeholder="Email"
          className="w-full bg-[#15161F] border border-[#2C2D42] rounded-[8px] px-[12px] py-[10px] text-[13px] outline-none focus:border-[#FF5533]"
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          required
          placeholder="Min 6 chars, 1 uppercase, 1 lowercase, 1 number"
          className="w-full bg-[#15161F] border border-[#2C2D42] rounded-[8px] px-[12px] py-[10px] text-[13px] outline-none focus:border-[#FF5533]"
          onChange={handleChange}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
}

export default Register;