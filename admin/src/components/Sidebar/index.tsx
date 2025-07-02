import React from 'react'
import { MenuData } from '../../utils/MeunData'
import { Link } from 'react-router'

const Sidebar = () => {
  return (
    <div className='w-64 bg-[#101828] min-h-full flex flex-col gap-3 px-2 py-4'>
      <h1 className='primaryFont text-2xl text-white mt-5'>Admin Assitfy</h1>
      <div className='flex flex-col gap-2 mt-3'>
        {
          MenuData.map((item)=>(
            <Link to={item.path} className='flex items-center gap-4 text-white px-2 py-4 hover:bg-[#162042]' key={item.id}>
               <item.icon className='text-2xl' />
              <span className='text-lg secondaryFont'>{item.name}</span>
            </Link>
          ))
        }
      </div>
    </div>
  )
}

export default Sidebar