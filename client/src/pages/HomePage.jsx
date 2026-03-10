
import React from 'react'
import ChatContainer from '../components/ChatContainer'
import RightSidebar from '../components/RightSidebar'
import Sidebar from '../components/Sidebar'

const HomePage = () => {
  return (
    <div className="border w-full h-screen sm:px-[15%] sm:py-[5%]">
      <div>
         <Sidebar/>
        <ChatContainer/>
        <RightSidebar/>
        
      </div>
    </div>
  )
 
}

export default HomePage