"use client"
import Navbar from '@/components/Navbar/Navbar'
import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

const retrieveProducts = async ({queryKey}) => {
    console.log("queryKey", queryKey);
  const response = await axios.get(`https://68f9c1b2ef8b2e621e7d4f9a.mockapi.io/ap1/v1/products?page=${queryKey[1].page}&limit=${queryKey[2].limit}`);
  return response.data
}

const page = () => {
    const [page, setPage] = useState(1);
   const {data: products, error,isLoading }  =useQuery({
    queryKey: ['products', {page},{limit:10}],
    queryFn: retrieveProducts,
    retry:false,
    staleTime: 1000,  

   })

   console.log("products", products);


  return (
    <div className='w-full'>
        <Navbar />
        <p>This is Product pages</p>
    </div>
  )
}

export default page