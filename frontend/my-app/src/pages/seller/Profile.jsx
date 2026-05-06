import React, { useEffect, useState } from "react";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [shop, setShop] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressFormData, setAddressFormData] = useState({
    street: "",
    city: "",
    postalcode: "",
    country: "",
    isdefault: false,
  });

  // Fetch user profile
  const fetchProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      const token = user?.token;

      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      const response = await fetch("http://localhost:5000/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to load profile");
      }

      const json = await response.json();

      if (!json.success) {
        throw new Error(json.message || "Profile request failed");
      }

      setProfile(json.data || null);
      setAddresses(json.data?.addresses || []);
    } catch (err) {
      setError(err.message || "Unable to load profile");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch shop details
  const fetchShopDetails = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      const token = user?.token;

      if (!token) {
        return;
      }

      const response = await fetch("http://localhost:5000/api/seller/shop", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const json = await response.json();
        if (json.success) {
          setShop(json.data || null);
        }
      }
    } catch (err) {
      console.error("Error fetching shop details:", err);
    }
  };

  // Add or update address
  const handleAddressSubmit = async (e) => {
    e.preventDefault();

    if (
      !addressFormData.street ||
      !addressFormData.city ||
      !addressFormData.postalcode ||
      !addressFormData.country
    ) {
      alert("Please fill in all address fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      const token = user?.token;

      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      const method = editingAddressId ? "PUT" : "POST";
      const url = editingAddressId
        ? `http://localhost:5000/api/user/address/${editingAddressId}`
        : `http://localhost:5000/api/user/address`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify(addressFormData),
      });

      if (!response.ok) {
        throw new Error(
          editingAddressId
            ? "Failed to update address"
            : "Failed to add address",
        );
      }

      const json = await response.json();

      if (!json.success) {
        throw new Error(json.message || "Address operation failed");
      }

      setAddressFormData({
        street: "",
        city: "",
        postalcode: "",
        country: "",
        isdefault: false,
      });
      setEditingAddressId(null);
      setShowAddressForm(false);
      fetchProfile();
    } catch (err) {
      setError(err.message || "Unable to save address");
    } finally {
      setLoading(false);
    }
  };

  // Delete address
  const deleteAddress = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?")) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      const token = user?.token;

      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      const response = await fetch(
        `http://localhost:5000/api/user/address/${addressId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete address");
      }

      const json = await response.json();

      if (!json.success) {
        throw new Error(json.message || "Delete failed");
      }

      fetchProfile();
    } catch (err) {
      setError(err.message || "Unable to delete address");
    } finally {
      setLoading(false);
    }
  };

  // Edit address
  const startEditAddress = (address) => {
    setEditingAddressId(address._id || address.id);
    setAddressFormData({
      street: address.street || "",
      city: address.city || "",
      postalcode: address.postalcode || "",
      country: address.country || "",
      isdefault: address.isdefault || false,
    });
    setShowAddressForm(true);
  };

  // Reset form
  const resetAddressForm = () => {
    setAddressFormData({
      street: "",
      city: "",
      postalcode: "",
      country: "",
      isdefault: false,
    });
    setEditingAddressId(null);
    setShowAddressForm(false);
  };

  useEffect(() => {
    fetchProfile();
    fetchShopDetails();
  }, []);

  return (
    <div style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
      <h1>My Profile</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {loading && <p>Loading profile...</p>}

      {!loading && profile && (
        <div>
          <section
            style={{
              marginBottom: "30px",
              padding: "20px",
              backgroundColor: "#f5f5f5",
              borderRadius: "8px",
            }}
          >
            <h2>Personal Information</h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "15px",
              }}
            >
              <div>
                <p style={{ marginBottom: "5px", fontWeight: "bold" }}>
                  First Name:
                </p>
                <p>{profile.firstname || "N/A"}</p>
              </div>
              <div>
                <p style={{ marginBottom: "5px", fontWeight: "bold" }}>
                  Last Name:
                </p>
                <p>{profile.lastname || "N/A"}</p>
              </div>
              <div>
                <p style={{ marginBottom: "5px", fontWeight: "bold" }}>
                  Email:
                </p>
                <p>{profile.email || "N/A"}</p>
              </div>
              <div>
                <p style={{ marginBottom: "5px", fontWeight: "bold" }}>
                  Phone Number:
                </p>
                <p>{profile.phonenumber || "N/A"}</p>
              </div>
              <div>
                <p style={{ marginBottom: "5px", fontWeight: "bold" }}>
                  Date of Birth:
                </p>
                <p>
                  {profile.dob
                    ? new Date(profile.dob).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <div>
                <p style={{ marginBottom: "5px", fontWeight: "bold" }}>Role:</p>
                <p style={{ textTransform: "capitalize" }}>
                  {profile.role || "N/A"}
                </p>
              </div>
            </div>
          </section>

          {shop && (
            <section
              style={{
                marginBottom: "30px",
                padding: "20px",
                backgroundColor: "#f0f9ff",
                borderRadius: "8px",
                border: "2px solid #007bff",
              }}
            >
              <h2>Shop Details</h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "15px",
                }}
              >
                <div>
                  <p style={{ marginBottom: "5px", fontWeight: "bold" }}>
                    Shop Name:
                  </p>
                  <p>{shop.shopname || "N/A"}</p>
                </div>
                <div>
                  <p style={{ marginBottom: "5px", fontWeight: "bold" }}>
                    Verification Status:
                  </p>
                  <p
                    style={{
                      color:
                        shop.isverified === "verified" ? "#28a745" : "#ffc107",
                      fontWeight: "bold",
                      textTransform: "capitalize",
                    }}
                  >
                    {shop.isverified || "N/A"}
                  </p>
                </div>
                <div>
                  <p style={{ marginBottom: "5px", fontWeight: "bold" }}>
                    Shop Address:
                  </p>
                  <p>
                    {typeof shop.shopaddress === "string"
                      ? shop.shopaddress
                      : shop.shopaddress
                        ? `${shop.shopaddress.street || ""}, ${shop.shopaddress.city || ""}, ${shop.shopaddress.postalcode || ""}, ${shop.shopaddress.country || ""}`.replace(
                            /^, |, $/,
                            "",
                          )
                        : "N/A"}
                  </p>
                </div>
                <div>
                  <p style={{ marginBottom: "5px", fontWeight: "bold" }}>
                    Phone Number:
                  </p>
                  <p>{shop.phonenumber || "N/A"}</p>
                </div>
                <div>
                  <p style={{ marginBottom: "5px", fontWeight: "bold" }}>
                    Total Transaction:
                  </p>
                  <p>${parseFloat(shop.totaltransaction || 0).toFixed(2)}</p>
                </div>
                <div>
                  <p style={{ marginBottom: "5px", fontWeight: "bold" }}>
                    Bank Account:
                  </p>
                  <p>{shop.bankaccount ? "Verified" : "Not Verified"}</p>
                </div>
              </div>
            </section>
          )}

          <section style={{ marginBottom: "30px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2>Addresses</h2>
              <button
                onClick={() =>
                  showAddressForm
                    ? resetAddressForm()
                    : setShowAddressForm(true)
                }
                style={{
                  padding: "8px 16px",
                  backgroundColor: showAddressForm ? "#dc3545" : "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                {showAddressForm ? "Cancel" : "Add New Address"}
              </button>
            </div>

            {showAddressForm && (
              <form
                onSubmit={handleAddressSubmit}
                style={{
                  backgroundColor: "#f5f5f5",
                  padding: "20px",
                  borderRadius: "8px",
                  marginBottom: "20px",
                }}
              >
                <h3>{editingAddressId ? "Edit Address" : "Add New Address"}</h3>

                <div style={{ marginBottom: "15px" }}>
                  <label
                    htmlFor="street"
                    style={{ display: "block", marginBottom: "5px" }}
                  >
                    Street Address:
                  </label>
                  <input
                    id="street"
                    type="text"
                    value={addressFormData.street}
                    onChange={(e) =>
                      setAddressFormData({
                        ...addressFormData,
                        street: e.target.value,
                      })
                    }
                    placeholder="Enter street address"
                    style={{
                      width: "100%",
                      padding: "8px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div
                  style={{
                    marginBottom: "15px",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "15px",
                  }}
                >
                  <div>
                    <label
                      htmlFor="city"
                      style={{ display: "block", marginBottom: "5px" }}
                    >
                      City:
                    </label>
                    <input
                      id="city"
                      type="text"
                      value={addressFormData.city}
                      onChange={(e) =>
                        setAddressFormData({
                          ...addressFormData,
                          city: e.target.value,
                        })
                      }
                      placeholder="Enter city"
                      style={{
                        width: "100%",
                        padding: "8px",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="postalcode"
                      style={{ display: "block", marginBottom: "5px" }}
                    >
                      Postal Code:
                    </label>
                    <input
                      id="postalcode"
                      type="text"
                      value={addressFormData.postalcode}
                      onChange={(e) =>
                        setAddressFormData({
                          ...addressFormData,
                          postalcode: e.target.value,
                        })
                      }
                      placeholder="Enter postal code"
                      style={{
                        width: "100%",
                        padding: "8px",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label
                    htmlFor="country"
                    style={{ display: "block", marginBottom: "5px" }}
                  >
                    Country:
                  </label>
                  <input
                    id="country"
                    type="text"
                    value={addressFormData.country}
                    onChange={(e) =>
                      setAddressFormData({
                        ...addressFormData,
                        country: e.target.value,
                      })
                    }
                    placeholder="Enter country"
                    style={{
                      width: "100%",
                      padding: "8px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label
                    htmlFor="isdefault"
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <input
                      id="isdefault"
                      type="checkbox"
                      checked={addressFormData.isdefault}
                      onChange={(e) =>
                        setAddressFormData({
                          ...addressFormData,
                          isdefault: e.target.checked,
                        })
                      }
                      style={{ marginRight: "8px" }}
                    />
                    Set as default address
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: loading ? "default" : "pointer",
                    opacity: loading ? 0.5 : 1,
                  }}
                >
                  {loading
                    ? "Saving..."
                    : editingAddressId
                      ? "Update Address"
                      : "Add Address"}
                </button>
              </form>
            )}

            {addresses.length === 0 && !showAddressForm && (
              <p>No addresses saved. Add one to get started.</p>
            )}

            {addresses.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: "15px",
                }}
              >
                {addresses.map((address) => (
                  <div
                    key={address._id || address.id}
                    style={{
                      padding: "15px",
                      border: address.isdefault
                        ? "2px solid #007bff"
                        : "1px solid #ddd",
                      borderRadius: "8px",
                      backgroundColor: address.isdefault ? "#f0f7ff" : "white",
                    }}
                  >
                    {address.isdefault && (
                      <p
                        style={{
                          marginTop: "0",
                          marginBottom: "10px",
                          color: "#007bff",
                          fontWeight: "bold",
                          fontSize: "12px",
                        }}
                      >
                        DEFAULT ADDRESS
                      </p>
                    )}
                    <p style={{ marginBottom: "5px" }}>
                      <strong>{address.street}</strong>
                    </p>
                    <p style={{ marginBottom: "5px" }}>
                      {address.city}, {address.postalcode}
                    </p>
                    <p style={{ marginBottom: "15px" }}>{address.country}</p>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        onClick={() => startEditAddress(address)}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#007bff",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteAddress(address._id || address.id)}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#dc3545",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {!loading && !profile && (
        <p>Unable to load profile. Please try again later.</p>
      )}
    </div>
  );
};

export default Profile;
