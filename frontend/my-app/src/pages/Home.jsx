import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import UserNavbar from "../components/UserNavbar";
import AdBanner from "../components/banner/AdBanner";
import ProductCard from "../components/ProductCard";

function Home() {
  return (
    <div>
      <UserNavbar />
      <AdBanner />
      <div className="px-10 py-8">
        <h2 className="text-xl font-semibold mb-6 text-center">
          {" "}
          Our Products
        </h2>
        <div className="grid grid-cols-5 gap-2">
          <ProductCard />
          <ProductCard />
          <ProductCard />
          <ProductCard />
          <ProductCard />
          <ProductCard />
        </div>
      </div>
    </div>
  );
}

export default Home;
