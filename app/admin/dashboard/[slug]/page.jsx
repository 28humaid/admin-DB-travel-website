"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import CreateUser from '@/components/adminDashboard/createUser';
import UsersDetails from '@/components/adminDashboard/usersDetails';
import ExcelUpload from '@/components/adminDashboard/excelUpload';

const page = () => {
  const { slug } = useParams();

  // Map routes to sample content
  const contentMap = {
    createUser: <CreateUser/>,
    usersDetails: <UsersDetails/>,
    excelUpload:<ExcelUpload/>
    
    // logout ka logic yha bnana hai!
  };

  // Display content based on the slug, default to welcome message
  const content = contentMap[slug] || <div>Welcome to the Admin Dashboard</div>;

  return (
    <div>
      {content}
    </div>
  );
};

export default page;