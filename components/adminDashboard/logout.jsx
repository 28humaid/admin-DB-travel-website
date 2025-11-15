import React, { useState } from 'react'
import Button from '../common/button'
import { useRouter } from 'next/navigation'
import { AlertTriangle } from 'lucide-react'
import { signOut } from 'next-auth/react'

const Logout = () => {
    const router = useRouter()
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    const handleCancelClick = () => {
        router.back()
    }
    const handleYesClick = () => {
        setIsLoggingOut(true)
        signOut()
    }
  return (
    <>
        <div
        className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
        >
            <div className='flex flex-col bg-blue-300 p-4 rounded-lg gap-2'>
                <p className="text-sm md:text-xl">Are you sure you want to logout?</p>
                <div className='flex items-center justify-center'><AlertTriangle className="w-24 h-24 text-red-500" /></div>
                <div className="flex flex-col md:flex-row items-center justify-center gap-2">

                    <Button 
                        variant='danger' 
                        className="w-full" 
                        onClick={handleYesClick} 
                        loading={isLoggingOut}
                        loadingText="Ok..."
                    >
                        Yes
                    </Button>

                    <Button variant='warning' className="w-full" onClick={handleCancelClick} disabled={isLoggingOut}>Cancel</Button>
                </div>
            </div>
        </div>
    </>
  )
}

export default Logout