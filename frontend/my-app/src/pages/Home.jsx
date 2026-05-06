import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import UserNavbar from "../components/UserNavbar";
import AdBanner from "../components/banner/AdBanner";
import ProductCard from "../components/ProductCard";

function Home() {
  const location = useLocation();
  const [products, setproducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(12);
  const [searchQuery, setSearchQuery] = useState("");

  const getProducts = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page,
        limit: limit,
      });

      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const res = await fetch(`http://localhost:5000/api/product?${params}`);
      const data = await res.json();

      if (data.success) {
        setproducts(data.data || []);
        // Calculate total pages - if the API returns pagination info
        if (data.pagination) {
          setTotalPages(data.pagination.pages || 1);
        } else if (data.total) {
          setTotalPages(Math.ceil(data.total / limit));
        } else {
          // Fallback: assume all products fit in one page
          setTotalPages(1);
        }
        setCurrentPage(page);
      }
    } catch (error) {
      console.log("fetching error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get("search") || "";
    setSearchQuery(search);
    setCurrentPage(1);
    getProducts(1);
  }, [location.search]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      getProducts(currentPage + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      getProducts(currentPage - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div>
      <UserNavbar />
      <AdBanner />
      <div className="text-center" style={{ padding: "20px" }}>
        {loading && (
          <div className="loading">
            <p>Loading products...</p>
          </div>
        )}

        {!loading && products.length === 0 && <p>No products found</p>}

        {!loading && products.length > 0 && (
          <div>
            <div
              className="grid grid-cols-2 md:grid-cols-5 gap-3"
              style={{ marginBottom: "30px" }}
            >
              {products.map((product) => (
                <div key={product._id}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "15px",
                  marginTop: "30px",
                  paddingTop: "20px",
                  borderTop: "1px solid #eee",
                }}
              >
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: currentPage === 1 ? "#ccc" : "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: currentPage === 1 ? "default" : "pointer",
                    fontSize: "14px",
                  }}
                >
                  Previous
                </button>

                <div
                  style={{
                    display: "flex",
                    gap: "5px",
                    alignItems: "center",
                  }}
                >
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => getProducts(page)}
                        style={{
                          padding: "8px 12px",
                          backgroundColor:
                            page === currentPage ? "#007bff" : "#f5f5f5",
                          color: page === currentPage ? "white" : "black",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: page === currentPage ? "bold" : "normal",
                        }}
                      >
                        {page}
                      </button>
                    ),
                  )}
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: "10px 20px",
                    backgroundColor:
                      currentPage === totalPages ? "#ccc" : "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: currentPage === totalPages ? "default" : "pointer",
                    fontSize: "14px",
                  }}
                >
                  Next
                </button>
              </div>
            )}

            <div style={{ marginTop: "20px", color: "#666", fontSize: "14px" }}>
              Page {currentPage} of {totalPages}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
