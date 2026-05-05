import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import UserNavbar from "../components/UserNavbar";
import AdBanner from "../components/banner/AdBanner";
import ProductCard from "../components/ProductCard";

function Home() {
const [products, setproducts] = useState([])
 const [loading, setLoading] = useState(true);
  const getProducts=async()=>{
   try {
     const res=await fetch("http://localhost:500/api/product")
    const data=await res.json()
    if(data.success){
      setproducts(data.data)
    }
   } catch (error) {
    console.log("fetchinig error",error)
   } finally{
    setLoading(false)
  
   }
  }
  useEffect(() => {
    getProducts()
  }, [])

  return (
  <div>
      <UserNavbar />
      <AdBanner />

      <div className="text-center">

        {loading && (
          <div className="loading">
            <p>Loading products...</p>
          </div>
        )}

        {!loading && products.length === 0 && (
          <p>No products found</p>
        )}

        {!loading && products.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {products.map((product) => (
              <div key={product._id}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default Home;
