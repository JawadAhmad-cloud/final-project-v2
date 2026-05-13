import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBirthdayCake,
  FaShieldAlt,
} from "react-icons/fa";

const UserProfile = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/user/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();

        if (data.success) {
          setProfile(data.data);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  if (!user || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600">Loading profile...</p>
      </div>
    );
  }

  const displayProfile = profile || user;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
            My Profile
          </h1>

          <div className="grid grid-cols-1 gap-6">
            {/* Username */}
            <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
              <FaUser className="text-purple-600 text-2xl" />
              <div>
                <p className="text-sm text-gray-600 uppercase tracking-wide">
                  Username
                </p>
                <p className="text-lg font-semibold text-gray-800">
                  {displayProfile?.username || "N/A"}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
              <FaEnvelope className="text-purple-600 text-2xl" />
              <div>
                <p className="text-sm text-gray-600 uppercase tracking-wide">
                  Email Address
                </p>
                <p className="text-lg font-semibold text-gray-800">
                  {displayProfile?.email || "N/A"}
                </p>
              </div>
            </div>

            {/* First Name */}
            <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
              <FaUser className="text-purple-600 text-2xl" />
              <div>
                <p className="text-sm text-gray-600 uppercase tracking-wide">
                  First Name
                </p>
                <p className="text-lg font-semibold text-gray-800">
                  {displayProfile?.firstname || "N/A"}
                </p>
              </div>
            </div>

            {/* Last Name */}
            <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
              <FaUser className="text-purple-600 text-2xl" />
              <div>
                <p className="text-sm text-gray-600 uppercase tracking-wide">
                  Last Name
                </p>
                <p className="text-lg font-semibold text-gray-800">
                  {displayProfile?.lastname || "N/A"}
                </p>
              </div>
            </div>

            {/* Phone Number */}
            <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
              <FaPhone className="text-purple-600 text-2xl" />
              <div>
                <p className="text-sm text-gray-600 uppercase tracking-wide">
                  Phone Number
                </p>
                <p className="text-lg font-semibold text-gray-800">
                  {displayProfile?.phonenumber || "N/A"}
                </p>
              </div>
            </div>

            {/* Date of Birth */}
            <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
              <FaBirthdayCake className="text-purple-600 text-2xl" />
              <div>
                <p className="text-sm text-gray-600 uppercase tracking-wide">
                  Date of Birth
                </p>
                <p className="text-lg font-semibold text-gray-800">
                  {displayProfile?.dob
                    ? new Date(displayProfile.dob).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>

            {/* Role */}
            <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
              <FaShieldAlt className="text-purple-600 text-2xl" />
              <div>
                <p className="text-sm text-gray-600 uppercase tracking-wide">
                  Role
                </p>
                <p className="text-lg font-semibold text-purple-600 capitalize">
                  {displayProfile?.role || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

