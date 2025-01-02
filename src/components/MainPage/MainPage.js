import React from 'react'
import { useAuth0 } from "@auth0/auth0-react"
import Navbar from '../NavBar/Navbar'
import { useNavigate } from 'react-router-dom'


export default function MainPage() {
    const {user} = useAuth0()
    const navigate = useNavigate()
    const handleclick = ()=>{
      navigate("/floorplan2d")
    }
    
  return (
    <div>
        <Navbar/>
        <button onClick={handleclick}>go to 2d</button>
    </div>
  )
}
