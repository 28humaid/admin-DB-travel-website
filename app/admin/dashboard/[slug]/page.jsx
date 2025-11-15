"use client";

import React, { Suspense } from 'react';
import { useParams } from 'next/navigation';
import CreateUser from '@/components/adminDashboard/createUser';
import UsersDetails from '@/components/adminDashboard/usersDetails';
import ExcelUpload from '@/components/adminDashboard/excelUpload';
import Logout from '@/components/adminDashboard/logout';
import ViewExcel from '@/components/adminDashboard/viewExcel';

const page = () => {
  const { slug } = useParams();

  // Map routes to sample content
  const contentMap = {
    createUser: <CreateUser/>,
    usersDetails: <UsersDetails/>,
    excelUpload:<ExcelUpload/>,
    logout: <Logout/>,
    viewExcel: <ViewExcel/>
  };

  if (!slug){
    return <div>Loading....</div>
  }

  // Display content based on the slug, default to welcome message
  const content = contentMap[slug] || <div>Welcome to the Admin Dashboard, Click an option to continue</div>;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div>{content}</div>
    </Suspense>
  );
};

export default page;