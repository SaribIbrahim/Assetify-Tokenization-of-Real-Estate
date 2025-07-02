import { User, LogOut, X } from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../../AuthContaxt/authContaxt';
import { useNavigate } from 'react-router';


const Header = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-20 bg-[#101828] w-full flex justify-end px-4">
      <div className="flex items-center text-white gap-4">
        <button
          onClick={toggleModal}
          className="flex items-center gap-4 focus:outline-none"
        >
          <div className="w-10 h-10 rounded-full bg-[#162042] flex items-center justify-center">
            <User />
          </div>
          <span className="secondaryFont text-md">Admin</span>
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-transparent bg-opacity-90 backdrop-blur-md transition-opacity duration-300">
          <div className="bg-[#101828] w-96 rounded-lg shadow-2xl p-6 relative transform transition-all duration-300 scale-100 opacity-100">
            {/* Close Button */}
            <button
              onClick={toggleModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white focus:outline-none"
            >
              <X size={20} color={'white'} />
            </button>

            {/* Modal Content */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#162042] flex items-center justify-center">
                <User size={32} color={'white'} />
              </div>
              <div className="text-center">
                <h2 className="secondaryFont text-white text-lg font-semibold">John Doe</h2>
                <p className="secondaryFont text-gray-400 text-sm">Admin</p>
              </div>
              <button
                onClick={() => {
                  handleLogout();
                  setIsModalOpen(false);
                }}
                className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-[#162042] text-white rounded-md hover:bg-[#1d2a5b] secondaryFont text-sm transition-colors duration-200"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;