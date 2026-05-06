import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [cart, setcart] = useState(
    JSON.parse(localStorage.getItem("cart")) || [],
  );
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const register = async (formData) => {
    const res = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw data;
    }

    return data;
  };

  const login = async (formData) => {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (!data.success) {
      throw data;
    }

    const user = data.data;

    setUser(user);
    localStorage.setItem("user", JSON.stringify(user));

    return user;
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser && storedUser !== "undefined") {
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  const setRoleApi = async (role) => {
    const res = await fetch("http://localhost:5000/api/auth/set-role", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ role }),
    });

    const data = await res.json();

    if (!data.success) {
      throw data;
    }

    const user = data.data;
    setUser(user);
    localStorage.setItem("user", JSON.stringify(user));
    return user;
  };

  const logout = async () => {
    try {
      await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("user");
    }
  };
  const addToCart = (product) => {
    const exists = cart.find((item) => item._id === product._id);

    if (exists) {
      setcart(
        cart.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
    } else {
      setcart([...cart, { ...product, quantity: 1, isSelected: true }]);
    }
  };
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const removeFromCart = (id) => {
    setcart(cart.filter((item) => item._id !== id));
  };
  const increaseQty = (id) => {
    setcart(
      cart.map((item) =>
        item._id === id ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  };

  // DECREASE QTY
  const decreaseQty = (id) => {
    setcart(
      cart.map((item) =>
        item._id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item,
      ),
    );
  };

  const removeOrderedItems = (orderedItems) => {
    setcart((prevCart) =>
      prevCart.filter(
        (cartItem) =>
          !orderedItems.some((orderItem) => orderItem.product === cartItem._id),
      ),
    );
  };

  const toggleSelect = (id) => {
    setcart(
      cart.map((item) =>
        item._id === id ? { ...item, isSelected: !item.isSelected } : item,
      ),
    );
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        register,
        login,
        setRoleApi,
        setUser,
        loading,
        logout,
        cart,
        addToCart,
        removeFromCart,
        increaseQty,
        decreaseQty,
        removeOrderedItems,
        toggleSelect,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
