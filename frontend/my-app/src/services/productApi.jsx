const API_URL = "http://localhost:5000/api/product";

// Get all products with filters
export const fetchProducts = async (
  page = 1,
  limit = 20,
  search = "",
  category = "",
) => {
  const params = new URLSearchParams();
  if (page) params.append("page", page);
  if (limit) params.append("limit", limit);
  if (search) params.append("search", search);
  if (category) params.append("category", category);

  const res = await fetch(`${API_URL}?${params.toString()}`);

  if (!res.ok) {
    throw new Error(`Failed to fetch products: ${res.statusText}`);
  }

  return await res.json();
};

// Get product details by ID
export const fetchProductById = async (productId) => {
  const res = await fetch(`${API_URL}/${productId}`);

  if (!res.ok) {
    throw new Error(`Failed to fetch product: ${res.statusText}`);
  }

  return await res.json();
};
