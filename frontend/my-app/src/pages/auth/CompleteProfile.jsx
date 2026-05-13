import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const currentYear = new Date().getFullYear();
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const CompleteProfile = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    phonenumber: "",
    dob: `${currentYear - 18}-01-01`,
  });

  const [dobState, setDobState] = useState({
    day: 1,
    month: 1,
    year: currentYear - 18,
  });

  const [errors, setErrors] = useState([]);

  useEffect(() => {
    const daysInMonth = new Date(dobState.year, dobState.month, 0).getDate();
    if (dobState.day > daysInMonth) {
      setDobState((prev) => ({
        ...prev,
        day: daysInMonth,
      }));
    }
  }, [dobState.month, dobState.year]);

  useEffect(() => {
    const monthValue = String(dobState.month).padStart(2, "0");
    const dayValue = String(dobState.day).padStart(2, "0");
    setFormData((prev) => ({
      ...prev,
      dob: `${dobState.year}-${monthValue}-${dayValue}`,
    }));
  }, [dobState]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleDobChange = (key, value) => {
    setDobState((prev) => ({
      ...prev,
      [key]: Number(value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const storedUser = sessionStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      const token = user?.token;

      if (!token) {
        setErrors(["No authentication token found. Please log in again."]);
        return;
      }

      const res = await fetch(
        "http://localhost:5000/api/user/profile/complete",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        },
      );

      const data = await res.json();
      if (data.success) {
        const updatedUser = user; // IMPORTANT
        console.log(updatedUser);
        if (updatedUser.role === "user") {
          navigate("/", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      }
      if (!data.success) {
        throw data;
      }

      alert("Profile completed successfully");
    } catch (error) {
      if (error?.errors) {
        setErrors(error.errors);
      } else if (error?.message) {
        setErrors([error.message]);
      } else {
        setErrors(["Something went wrong"]);
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="card p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Complete Your Profile
        </h2>

        {errors.length > 0 && (
          <div className="alert-error mb-4">
            {errors.map((err, i) => (
              <p key={i}>{err}</p>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email (Read Only) */}
          <div>
            <label className="label-primary">Email</label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="input-field"
            />
          </div>

          {/* Role (Read Only) */}
          <div>
            <label className="label-primary">Role</label>
            <input
              type="text"
              value={user?.role || ""}
              disabled
              className="input-field"
            />
          </div>

          {/* First Name */}
          <div>
            <label className="label-primary">First Name</label>
            <input
              type="text"
              name="firstname"
              value={formData.firstname}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="label-primary">Last Name</label>
            <input
              type="text"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="label-primary">Phone Number</label>
            <input
              type="text"
              name="phonenumber"
              value={formData.phonenumber}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          {/* Date of Birth */}
          <div className="date-panel">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <label className="label-primary">Date of Birth</label>
              <span className="text-sm text-muted">
                Selected:{" "}
                <span className="date-preview">
                  {`${monthNames[dobState.month - 1]} ${dobState.day}, ${dobState.year}`}
                </span>
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label-primary" htmlFor="month-select">
                  Month
                </label>
                <select
                  id="month-select"
                  value={dobState.month}
                  onChange={(e) => handleDobChange("month", e.target.value)}
                  className="input-field"
                >
                  {monthNames.map((month, index) => (
                    <option key={month} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-primary" htmlFor="day-select">
                  Day
                </label>
                <select
                  id="day-select"
                  value={dobState.day}
                  onChange={(e) => handleDobChange("day", e.target.value)}
                  className="input-field"
                >
                  {Array.from(
                    {
                      length: new Date(
                        dobState.year,
                        dobState.month,
                        0,
                      ).getDate(),
                    },
                    (_, idx) => idx + 1,
                  ).map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5">
              <label className="label-primary" htmlFor="year-slider">
                Year
              </label>
              <input
                id="year-slider"
                type="range"
                min="1900"
                max={currentYear}
                step="1"
                value={dobState.year}
                onChange={(e) => handleDobChange("year", e.target.value)}
                className="date-slider"
              />
              <div className="mt-2 text-sm text-muted">
                Year selected: <strong>{dobState.year}</strong>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" className="w-full btn-primary">
            Complete Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;
