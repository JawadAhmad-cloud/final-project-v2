import React, { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

function VerifyEmail() {
  const { verifyEmail, resendOTP } = useContext(AuthContext);
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState([]);
  const [success, setSuccess] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  const parseApiError = (error, fallbackMessage) => {
    const status = error?.response?.status;
    const responseData = error?.response?.data || error;

    if (status === 401) {
      return ["Unauthorized. Please sign in again."];
    }

    if (responseData?.errors) {
      return responseData.errors.map((e) => e.msg || e);
    }

    if (responseData?.message) {
      return [responseData.message];
    }

    return [fallbackMessage];
  };

  const handleOtpChange = (e) => {
    const value = e.target.value;
    // Only allow digits and limit to 6 characters
    if (/^\d{0,6}$/.test(value)) {
      setOtp(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError([]);
    setSuccess("");

    if (!otp || otp.length !== 6) {
      setError(["Please enter a valid 6-digit OTP"]);
      setLoading(false);
      return;
    }

    try {
      const res = await verifyEmail({ otp });

      if (res?.data?.roleRequired) {
        setSuccess("Email verified successfully!");
        setTimeout(() => {
          navigate("/role");
        }, 1000);
      }
    } catch (error) {
      console.error("Error:", error);
      const parsedErrors = parseApiError(error, "Verification failed");
      setError(parsedErrors);

      if (error?.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    setResendLoading(true);
    setError([]);
    setSuccess("");

    try {
      await resendOTP();
      setSuccess("OTP sent successfully to your email!");
      setOtp("");

      // Set 60 second timer before allowing resend again
      setResendTimer(60);
      const interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error("Error:", error);
      const parsedErrors = parseApiError(error, "Failed to resend OTP");
      setError(parsedErrors);

      if (error?.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-[420px] bg-white border border-gray-300 rounded-lg p-9 shadow-lg">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-800 mb-6 font-semibold"
        >
          <FaArrowLeft />
          Back to Home
        </button>

        <h2 className="text-2xl font-bold mb-2 text-center text-purple-600">
          Verify Email
        </h2>

        <p className="text-sm text-gray-600 text-center mb-6">
          Enter the 6-digit OTP sent to your email address
        </p>

        {error.length > 0 && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded text-sm mb-4">
            {error.map((err, index) => (
              <p key={index}>{err}</p>
            ))}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 p-3 rounded text-sm mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div>
            <input
              type="text"
              value={otp}
              placeholder="Enter 6-digit OTP"
              maxLength="6"
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-center text-2xl tracking-widest outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200 font-bold"
              onChange={handleOtpChange}
              autoFocus
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-2 text-center">
              {otp.length}/6 digits entered
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-300">
          <p className="text-sm text-gray-600 text-center mb-3">
            Didn't receive the OTP?
          </p>

          <button
            onClick={handleResendOTP}
            disabled={resendLoading || resendTimer > 0}
            className="w-full bg-gray-200 text-gray-700 p-2 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition text-sm"
          >
            {resendLoading
              ? "Sending..."
              : resendTimer > 0
                ? `Resend OTP in ${resendTimer}s`
                : "Resend OTP"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
