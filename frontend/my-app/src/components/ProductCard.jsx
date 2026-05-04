import React from 'react'

const ProductCard = () => {
// // const [filteredProducts, setfilteredProducts] = useState([])
// const [activefilter, setactivefilter] = useState("all")
// let setfilteredProducts;
// if(activefilter==="electronics"){
//     setfilteredProducts=products.filter((item)=>item.category==="electronics")
// }
// else if(activefilter==="clothes"){
//     setfilteredProducts=products.filter((item)=>item.category==="clothes")
// }
// else if(activefilter==="bags"){
//     setfilteredProducts=products.filter((item)=>item.category==="bags")
// }
// else if(activefilter==="beauty"){
//     setfilteredProducts=products.filter((item)=>item.category==="beauty")
// }
// else {
//  setfilteredProducts=products;
// }
  return (
    <div className='bg-white shadow rounded p-4 cursor-pointer hover:shadow-lg text-center'>
        <img src="/Images/m4.png" alt=""  className='h-40 object-contain w-full'/>
         <div className="text-yellow-400 mt-2">
        {/* {"★".repeat(Math.round(product.rating || 0))} */}
        ★★★★
      </div>

      {/* { <h3 className="text-sm font-medium mt-1">{product.name}</h3> } */}
        <h3 className='text-sm font-medium mt-1'>Name</h3>
      {/* <p className="font-semibold">${product.price}</p> */}
      <p className='font-semibold '>Price</p>
        </div>
  )
}

export default ProductCard