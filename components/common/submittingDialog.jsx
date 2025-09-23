import { LoaderCircle } from 'lucide-react'
import React from 'react'

const SubmittingDialog = () => {
  return (
    <div
    className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50"
    style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
    >
        <div className='flex flex-col bg-blue-300 p-4 rounded-lg gap-2'>
            <h2>User is being created...</h2>
            <LoaderCircle className="animate-spin" size={32} />
        </div>
    </div>
  )
}

export default SubmittingDialog