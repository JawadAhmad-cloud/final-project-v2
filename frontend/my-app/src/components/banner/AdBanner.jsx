import React from 'react'
import { HiOutlineTruck } from "react-icons/hi2";
import { RiSecurePaymentLine } from "react-icons/ri";
import { BiSupport } from "react-icons/bi";
import { RiShieldLine } from "react-icons/ri";
const AdBanner = () => {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      
      {/* HERO */}
      <section className="flex flex-col md:flex-row items-center justify-between bg-gradient-to-r from-purple-100 to-purple-200 rounded-2xl p-10 relative overflow-hidden">
        
        {/* LEFT CONTENT */}
        <div className="max-w-md h-1/2 z-10">
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            Latest Tech,<br />Smart Choice
          </h1>
          <p className="text-gray-600 mb-6">
            Discover the best gadgets and electronics at amazing prices.
          </p>
          <button className="bg-purple-600 text-white px-5 py-3 rounded-lg hover:bg-purple-700 transition">
            Shop Now
          </button>
        </div>

        {/* RIGHT IMAGES */}
        {/* <div className="relative w-full md:w-1/2 h-64 md:h-80 mt-10 md:mt-0">
          
          <img
            src="/images/watch.png"
            alt="watch"
            className="absolute w-40 top-0 left-10 md:left-0"
          />

          <img
            src="/images/phone.png"
            alt="phone"
            className="absolute w-44 right-10 md:right-0 top-10"
          />

          <img
            src="/images/earbuds.png"
            alt="earbuds"
            className="absolute w-24 bottom-0 left-1/3"
          />
        </div> */}
      </section>

      {/* FEATURES */}
      <section className="grid grid-cols-1  md:grid-cols-4 gap-6 bg-white rounded-xl p-6 mt-6 text-center shadow-sm">
        
        <div className='flex items-center justify-center gap-2'>
          <div>
           <HiOutlineTruck className='text-fuchsia-700 text-5xl'/>
          </div>
          <div>
             <h4 className="font-semibold">Free Shipping</h4>
          <p className="text-sm text-gray-500">On orders over $50</p>
          </div>
           
        </div>

        <div className='flex items-center justify-center gap-2'>
          <div >
            <RiSecurePaymentLine className='text-5xl text-fuchsia-700'/>
          </div>
          <div>
            <h4 className="font-semibold">Easy Returns</h4>
          <p className="text-sm text-gray-500">30 days return policy</p>
          </div>
        </div>

        <div  className='flex items-center justify-center'>
          <div>
            <BiSupport className='text-5xl text-fuchsia-700'/>
          </div>
         <div>
           <h4 className="font-semibold">Secure Payment</h4>
          <p className="text-sm text-gray-500">100% secure payment</p>
        </div>
</div>
        <div className='flex items-center justify-center'>

        <div>
          <RiShieldLine className='text-5xl text-fuchsia-700'/>
        </div>
          <div>
            <h4 className="font-semibold">24/7 Support</h4>
          <p className="text-sm text-gray-500">Dedicated support</p>
          </div>
        </div>

      </section>
    </div>
  );
}

export default AdBanner