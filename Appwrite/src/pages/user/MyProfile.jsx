import useAuthStore from '@/store/authStore'
import React from 'react'


function MyProfile() {
const user = useAuthStore((state) => state.user)
console.log(user)

  return (
    <>
    <div>MyProfile</div>
   
   <h1>Name : {user?.name}</h1>
   <h2>Email : {user?.email}</h2>

    </>
  )
}

export default MyProfile