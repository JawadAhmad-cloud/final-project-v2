import { useState, useEffect } from "react";
import { FaCheck, FaTimes, FaSearch, FaSync, FaTrash } from "react-icons/fa";

export default function ShopManagement() {
  const [shops, setShops] = useState([]);
  const [filteredShops, setFilteredShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedShops, setSelectedShops] = useState([]);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingShop, setRejectingShop] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedShopDetail, setSelectedShopDetail] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingShop, setDeletingShop] = useState(null);
  const storedAdmin = sessionStorage.getItem("admin");
  const admin = storedAdmin ? JSON.parse(storedAdmin) : null;
  const token = admin?.token || null;

  useEffect(() => {
    fetchShops();
  }, [page, statusFilter]);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page,
        limit: 10,
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(search && { search }),
      });

      const response = await fetch(
        `http://localhost:5000/api/admin/shops?${query}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = await response.json();
      const shopsList = data?.data?.shops || [];
      setShops(shopsList);
      setFilteredShops(shopsList);
      setTotalPages(data?.data?.pagination?.pages || 1);
    } catch (error) {
      console.error("Error fetching shops:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyShop = async (shopId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/shops/${shopId}/verify`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        fetchShops();
      }
    } catch (error) {
      console.error("Error verifying shop:", error);
    }
  };

  const handleRejectShop = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/shops/${rejectingShop}/reject`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ rejectionreason: rejectionReason }),
        },
      );

      if (response.ok) {
        setShowRejectModal(false);
        setRejectingShop(null);
        setRejectionReason("");
        fetchShops();
      }
    } catch (error) {
      console.error("Error rejecting shop:", error);
    }
  };

  const handleBulkVerify = async () => {
    if (selectedShops.length === 0) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/shops/bulk-verify`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ shopIds: selectedShops }),
        },
      );

      if (response.ok) {
        setSelectedShops([]);
        fetchShops();
      }
    } catch (error) {
      console.error("Error bulk verifying shops:", error);
    }
  };

  const handleViewDetails = (shop) => {
    setSelectedShopDetail(shop);
    setShowDetailModal(true);
  };

  const handleViewPendingShops = () => {
    setStatusFilter("pending");
    setPage(1);
    setSearch("");
  };

  const handleDeleteShop = async () => {
    if (!deletingShop) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/shops/${deletingShop}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        setShowDeleteModal(false);
        setDeletingShop(null);
        fetchShops();
      } else {
        alert("Failed to delete shop");
      }
    } catch (error) {
      console.error("Error deleting shop:", error);
      alert("Error deleting shop");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shop Management</h1>
          <p className="text-gray-600 mt-1">Manage and verify seller shops</p>
        </div>
        <button
          onClick={fetchShops}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          <FaSync /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="flex items-center space-x-2">
              <FaSearch className="text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by shop name..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {statusFilter === "pending" && selectedShops.length > 0 && (
          <div className="flex items-center justify-between pt-4 border-t">
            <p className="text-sm font-medium text-gray-700">
              {selectedShops.length} shop(s) selected
            </p>
            <button
              onClick={handleBulkVerify}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Verify Selected
            </button>
          </div>
        )}
      </div>

      {/* Shops Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Loading shops...</p>
          </div>
        ) : filteredShops.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {statusFilter === "pending" && (
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={
                            filteredShops.length > 0 &&
                            selectedShops.length === filteredShops.length
                          }
                          onChange={(e) =>
                            e.target.checked
                              ? setSelectedShops(
                                  filteredShops.map((s) => s._id || s.shopId),
                                )
                              : setSelectedShops([])
                          }
                          className="rounded"
                        />
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Shop Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Seller Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredShops.map((shop) => (
                    <tr
                      key={shop._id || shop.shopId}
                      className="border-b hover:bg-gray-50"
                    >
                      {statusFilter === "pending" && (
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedShops.includes(
                              shop._id || shop.shopId,
                            )}
                            onChange={(e) =>
                              e.target.checked
                                ? setSelectedShops([
                                    ...selectedShops,
                                    shop._id || shop.shopId,
                                  ])
                                : setSelectedShops(
                                    selectedShops.filter(
                                      (id) => id !== (shop._id || shop.shopId),
                                    ),
                                  )
                            }
                            className="rounded"
                          />
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">
                          {shop.shopname}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {shop.email}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            shop.isverified === "verified"
                              ? "bg-green-100 text-green-800"
                              : shop.isverified === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {shop.isverified}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {statusFilter === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  handleVerifyShop(shop._id || shop.shopId)
                                }
                                className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                              >
                                <FaCheck />
                              </button>
                              <button
                                onClick={() => {
                                  setRejectingShop(shop._id || shop.shopId);
                                  setShowRejectModal(true);
                                }}
                                className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                              >
                                <FaTimes />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleViewDetails(shop)}
                            className="px-3 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition text-sm font-medium"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => {
                              setDeletingShop(shop._id || shop.shopId);
                              setShowDeleteModal(true);
                            }}
                            className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                            title="Delete Shop"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-600">No shops found</p>
          </div>
        )}
      </div>

      {/* Shop Detail Modal */}
      {showDetailModal && selectedShopDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Shop Details</h2>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedShopDetail(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Shop Name</p>
                  <p className="font-medium text-gray-900">
                    {selectedShopDetail.shopname}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">
                    {selectedShopDetail.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium text-gray-900">
                    {selectedShopDetail.phonenumber || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedShopDetail.isverified === "verified"
                        ? "bg-green-100 text-green-800"
                        : selectedShopDetail.isverified === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedShopDetail.isverified}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600">Description</p>
                <p className="text-gray-900">
                  {selectedShopDetail.description || "No description provided"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p className="text-gray-900">
                  {selectedShopDetail.shopaddress
                    ? typeof selectedShopDetail.shopaddress === "string"
                      ? selectedShopDetail.shopaddress
                      : JSON.stringify(selectedShopDetail.shopaddress)
                    : "No address provided"}
                </p>
              </div>

              {selectedShopDetail.seller && (
                <div>
                  <p className="text-sm text-gray-600">Seller Information</p>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-900">
                      Name: {selectedShopDetail.seller.username || "N/A"}
                    </p>
                    <p className="text-gray-900">
                      Email: {selectedShopDetail.seller.email || "N/A"}
                    </p>
                    <p className="text-gray-900">
                      Phone: {selectedShopDetail.seller.phonenumber || "N/A"}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600">Created At</p>
                <p className="text-gray-900">
                  {selectedShopDetail.createdAt
                    ? new Date(
                        selectedShopDetail.createdAt,
                      ).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>

            <div className="flex space-x-3 mt-6 border-t pt-4">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedShopDetail(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Close
              </button>
              {selectedShopDetail.isverified === "pending" && (
                <>
                  <button
                    onClick={() => {
                      handleVerifyShop(
                        selectedShopDetail.shopId || selectedShopDetail._id,
                      );
                      setShowDetailModal(false);
                      setSelectedShopDetail(null);
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    Verify
                  </button>
                  <button
                    onClick={() => {
                      setRejectingShop(
                        selectedShopDetail.shopId || selectedShopDetail._id,
                      );
                      setShowDetailModal(false);
                      setSelectedShopDetail(null);
                      setShowRejectModal(true);
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Reject
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  setDeletingShop(
                    selectedShopDetail._id || selectedShopDetail.shopId,
                  );
                  setShowDetailModal(false);
                  setSelectedShopDetail(null);
                  setShowDeleteModal(true);
                }}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Reject Shop
            </h2>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting this shop.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 mb-4"
              rows="4"
            ></textarea>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectingShop(null);
                  setRejectionReason("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectShop}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Delete Shop
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this shop? This action cannot be
              undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingShop(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteShop}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
