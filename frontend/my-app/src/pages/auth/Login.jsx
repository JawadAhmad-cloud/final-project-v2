import React, { useContext, useState } from 'react'
import { AuthContext } from '../../context/AuthContext'
import {useNavigate} from 'react-router-dom'
function Login() {
  const [form, setform] = useState({
    email:"",
    password:""
  })
  const [errors, seterrors] = useState([])
  const navigate = useNavigate()
  const {login}=useContext(AuthContext)
  const handleSubmit=async(e)=>{
    e.preventDefault()
    try {
      const user =await login(form)
      if(user.role==="seller"){
        navigate("/seller/dashboard")
      }
      if(user.role==="user"){
        navigate("/user/dashboard")
      }
    } catch (error) {
  console.error("Error:", error);
  if(error.errors){
seterrors(error.errors.map((e)=>e.msg ||e))
  } else if(error?.message){
    seterrors([error.message])
  } else{
    seterrors("[Request failed]")
  }

  alert(
    error.errors?.[0]?.msg ||
    error.message ||
    "Request failed"
  );
}
  }
  const handleChange=(e)=>{
    setform({
      ...form,
      [e.target.name]:e.target.value
    })
  }

 return (
    <div className="flex items-center justify-center  bg-[#07080F] text-[#F0F1FF]">

  <form
    onSubmit={handleSubmit}
    className="w-[420px] bg-[#0F1018] border border-[#2C2D42] rounded-[18px] px-9 py-9 flex flex-col gap-[14px]"
  >
    <p className="text-[10px] tracking-[2px] text-[#454666] text-center uppercase mb-4">
      Login to your account
    </p>
{errors.length>0 &&(
  <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded text-sm">
            {errors.map((err, index) => (
              <p key={index}>{err}</p>
            ))}
          </div>
)}
    {/* Email */}
    <div className="flex flex-col gap-[5px]">
      <label className="text-[10px] uppercase tracking-[1px] text-[#454666] font-semibold">
        Email Address
      </label>
      <input
        type="email"
        name="email"
        placeholder="you@example.com"
        onChange={handleChange}
        className="w-full bg-[#15161F] border border-[#2C2D42] rounded-[8px] px-[12px] py-[10px] text-[13px] outline-none focus:border-[#FF5533]"
      />
    </div>

    {/* Password */}
    <div className="flex flex-col gap-[5px]">
      <label className="text-[10px] uppercase tracking-[1px] text-[#454666] font-semibold">
        Password
      </label>
      <input
        type="password"
        name="password"
        placeholder="••••••••"
        onChange={handleChange}
        className="w-full bg-[#15161F] border border-[#2C2D42] rounded-[8px] px-[12px] py-[10px] text-[13px] outline-none focus:border-[#FF5533]"
      />
    </div>

    {/* Forgot */}
    <div className="text-right text-[11px] text-[#FF5533] -mt-1">
      Forgot password?
    </div>

    {/* Button */}
    <button
      className="w-full mt-2 bg-[#FF5533] text-white py-[12px] rounded-[9px] font-bold tracking-wide hover:bg-[#ff7755] transition"
    >
      Login →
    </button>

  </form>

</div>
  );
};

export default Login