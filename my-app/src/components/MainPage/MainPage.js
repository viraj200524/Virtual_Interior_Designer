import React from 'react'
import { useAuth0 } from "@auth0/auth0-react"
import Navbar from '../NavBar/Navbar'

export default function MainPage() {
    const {user} = useAuth0()
  return (
    <div>
        <Navbar/>
    </div>
  )
}
