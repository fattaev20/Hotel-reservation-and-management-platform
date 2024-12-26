import React from "react";
import { Link } from "react-router-dom";

const GeneralRegistration = () => {
  return (
    <div className="bg-[#F3F4F6] h-[89vh] flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center items-center px-4">
        {/* Title */}
        <h1 className="text-center text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 mb-8">
          Please select how you want to register?
        </h1>

        {/* Registration Options */}
        <div className="flex flex-col gap-4 mb-6 w-full max-w-md">
          <Link
            to="/registerstaff"
            className="w-full py-3 text-center border border-blue-500 text-blue-600 font-medium rounded-md hover:bg-blue-500 hover:text-white transition-all"
          >
            Register as a hotel staff
          </Link>
          <Link
            to="/registerguest"
            className="w-full py-3 text-center border border-gray-300 text-gray-700 font-medium rounded-md hover:border-blue-500 hover:bg-blue-500 hover:text-white transition-all"
          >
            Register as a guest
          </Link>
        </div>

        {/* Next Button */}
        <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-all">
          Next
        </button>

        {/* Already Registered */}

        <div className="mt-6 text-sm text-gray-600 flex gap-2 items-center">
          <p>Already registered? </p>
          <Link
            to="/loginguest"
            className="text-blue-600 hover:underline font-medium"
          >
            Log in here as guest
          </Link>
          <p> or </p>
          <Link
            to="/loginstaff"
            className="text-blue-600 hover:underline font-medium"
          >
            Log in here as staff
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GeneralRegistration;
