const API_URL = "http://localhost:5000/api/auth";
export const apiFetch = async (endpoint, options = {}) => {
  const res = await fetch(`${API_URL}${endpoint}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  let data;
  try {
    data = await res.json();
  } catch (error) {
    data = {};
    console.log(error)
  }

  if (!res.ok) {
    // 🔥 IMPORTANT: throw FULL backend response
    throw {
      status: res.status,
      message: data.message,
      errors: data.errors,
      raw: data,
    };
  }

  return data;
};