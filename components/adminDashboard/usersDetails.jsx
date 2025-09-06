import React from 'react'
import { usersData } from '@/data/data'
import DataTable from '../common/dataTable';

// Mock delete function (token-based placeholder)
const handleDelete = (id) => {
  console.log(`Delete user with ID: ${id} (Token-based action)`);
  // Implement actual delete logic here (e.g., API call or state update)
};

const UsersDetails = () => {
    // console.log(usersData);
    
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Users Data Table</h1>
      <DataTable data={usersData} onDelete={handleDelete} />
    </div>
  )
}

export default UsersDetails