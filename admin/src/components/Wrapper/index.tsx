import React from 'react';
import Sidebar from '../Sidebar';
import Header from '../Header';

const Wrapper = ({ children }:any) => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1 ">
        <Header />
        <main className="flex-1 border-l-2 border-gray-700 border-t-2  bg-[#101828]">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Wrapper;