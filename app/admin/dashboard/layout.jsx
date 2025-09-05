import React from 'react'

const layout = ({children}) => {
  return (
    <div className="bg-red-500">
        I am layout of admin dashboard
        {children}
    </div>
  )
}

export default layout