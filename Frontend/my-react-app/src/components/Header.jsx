import { FaHome, FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header({ setUserRole, title = "Booking Portal" }) {
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("userData"));
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("userData");
    localStorage.removeItem("userRole");
    setUserRole(null);
    navigate("/generalregisteration");
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev); // Explicit toggle
  };

  return (
    <motion.header
      className="bg-[#2563EB] text-white shadow-md py-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-full mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Title Section */}
        <motion.div
          className="flex flex-col items-center text-center gap-1"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2">
            <FaHome className="w-6 h-6 md:w-8 md:h-8" />
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-wide leading-tight">
              UZBEKISTAN HOTEL
            </h1>
          </div>
          <h2 className="text-xs sm:text-sm md:text-base lg:text-lg font-medium tracking-wide leading-snug text-gray-200">
            RESERVATION & MANAGEMENT PORTAL
          </h2>
        </motion.div>

        {/* User Section */}
        <div className="relative">
          {userData ? (
            <>
              {/* Dropdown Toggle */}
              <motion.div
                className="cursor-pointer mt-2 flex items-center gap-2"
                onClick={toggleDropdown} // Explicitly toggles dropdown
                whileHover={{ scale: 1.05 }}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <FaUserCircle className="w-6 h-6 md:w-7 md:h-7 text-gray-200" />
                    <p className="text-sm sm:text-base md:text-lg font-semibold">
                      {userData.name}
                    </p>
                  </div>
                  <p className="text-sm sm:text-base text-right md:text-lg font-semibold">
                    ID: {userData.id}
                  </p>
                </div>
              </motion.div>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white text-gray-800 rounded-md shadow-lg z-10">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-red-500 rounded-md hover:text-white transition-colors duration-300"
                    >
                      <FaSignOutAlt className="inline-block mr-2" />
                      Log Out
                    </button>
                  </div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Link
                to="/generalregistration"
                className="flex items-center gap-2 text-sm sm:text-base md:text-lg font-semibold hover:text-gray-200 transition-colors duration-300"
              >
                <FaHome className="w-5 h-5" />
                {title}
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </motion.header>
  );
}
