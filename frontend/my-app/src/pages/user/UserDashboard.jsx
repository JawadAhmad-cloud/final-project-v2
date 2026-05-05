import React from 'react'
import UserNavbar from '../../components/UserNavbar'
import AdBanner from '../../components/banner/AdBanner'
import ProductCard from '../../components/ProductCard'
import { useState } from 'react'
import { useEffect } from 'react'

function UserDashboard() {
  const [products, setproducts] = useState([])
      const fetchProducts= async()=>{
      try {
        const res= await fetch("http://localhost:5000/api/product")
      const data= await res.json()
      if(data.success){
        setproducts(data.data)
        
      }
      } catch (error) {
        console.log("error in fetching products" , error)
      }
    }
    useEffect(() => {
     fetchProducts()
    }, [])
    
  return (
    <div>
      <AdBanner/>
      <div className='px-10 py-8'>
        <h2 className="text-xl font-semibold mb-6 text-center"> Our Products</h2>
        <div className='grid grid-cols-1 gap-2'>
        {products.map((product)=>(
          <ProductCard key={product.id} product={product}/>
        ))}
        </div>

      </div>
    </div>
  )
}

export default UserDashboard