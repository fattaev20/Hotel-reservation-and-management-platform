import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { IoArrowBackSharp } from "react-icons/io5";
import {
  MdPerson,
  MdDateRange,
  MdAttachMoney,
  MdInfoOutline,
} from "react-icons/md";
import { FaEye } from "react-icons/fa";

const BookingRequest = () => {
  const [loading, setLoading] = useState(false);
  const [bookingRequests, setBookingRequests] = useState([]);
  const navigate = useNavigate();

  const parseResponse = (response) => {
    if (!response || typeof response !== "string") {
      throw new Error("Invalid server response.");
    }
    const lines = response.split("\n");
    const jsonLine = lines.find(
      (line) => line.trim().startsWith("{") && line.trim().endsWith("}")
    );
    if (!jsonLine) {
      throw new Error("No valid JSON object found in response.");
    }
    return JSON.parse(jsonLine.trim());
  };

  const fetchBookingRequests = async () => {
    setLoading(true);
    document.body.style.overflow = "hidden"; // Disable scrolling while loading
    try {
      const response = await window.electronAPI.sendToServer({
        action: "get_booking_request",
      });
      const data = parseResponse(response.response);
      if (data.status === "success") {
        setBookingRequests(data.booking_requests || []);
      } else {
        console.error("Failed to fetch booking requests");
      }
    } catch (error) {
      console.error("Error fetching booking requests:", error);
    } finally {
      setLoading(false);
      document.body.style.overflow = ""; // Re-enable scrolling
    }
  };

  useEffect(() => {
    fetchBookingRequests();
  }, []);

  const handleViewDetails = (bookingId) => {
    navigate(`/request-details/${bookingId}`);
  };

  return (
    <div className="bg-[#F3F4F6] min-h-screen">
      <div className="max-w-full mx-auto px-6 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded shadow hover:bg-gray-300 hover:text-gray-900 transition-transform transform hover:scale-105"
          >
            <IoArrowBackSharp />
            Back
          </button>
        </motion.div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex justify-center items-center py-6">
            <motion.div
              className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          </div>
        ) : (
          // Booking Requests Table
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white shadow-md rounded-lg p-4"
          >
            <h2 className="text-xl font-bold mb-4 text-blue-600 flex items-center gap-2">
              <MdInfoOutline /> Booking Requests
            </h2>
            {bookingRequests.length > 0 ? (
              <div className="overflow-auto">
                <table className="min-w-full table-auto border-collapse">
                  <thead>
                    <motion.tr
                      className="bg-gray-100"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <th className="text-left px-4 py-2 text-sm font-medium text-gray-600">
                        <MdPerson className="inline-block mr-1 text-blue-500" />
                        Client Name
                      </th>
                      <th className="text-left px-4 py-2 text-sm font-medium text-gray-600">
                        <MdDateRange className="inline-block mr-1 text-blue-500" />
                        Check-in Date
                      </th>
                      <th className="text-left px-4 py-2 text-sm font-medium text-gray-600">
                        <MdDateRange className="inline-block mr-1 text-blue-500" />
                        Check-out Date
                      </th>
                      <th className="text-left px-4 py-2 text-sm font-medium text-gray-600">
                        <MdAttachMoney className="inline-block mr-1 text-green-500" />
                        Total Price
                      </th>
                      <th className="text-left px-4 py-2 text-sm font-medium text-gray-600">
                        Actions
                      </th>
                    </motion.tr>
                  </thead>
                  <tbody>
                    {bookingRequests.map((booking, idx) => (
                      <motion.tr
                        key={booking.BookingID}
                        className="hover:bg-gray-50 cursor-pointer"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <td className="px-4 py-2 text-sm text-gray-800">
                          <MdPerson className="inline-block text-blue-500 mr-1" />
                          {booking.Client.FullName}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-800">
                          <MdDateRange className="inline-block text-blue-500 mr-1" />
                          {booking.CheckinDate}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-800">
                          <MdDateRange className="inline-block text-blue-500 mr-1" />
                          {booking.CheckoutDate}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-800">
                          <MdAttachMoney className="inline-block text-green-500 mr-1" />
                          ${booking.TotalPrice.toFixed(2)}
                        </td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => handleViewDetails(booking.BookingID)}
                            className="flex items-center gap-2 text-blue-500 hover:text-blue-700 transition-transform transform hover:scale-105"
                          >
                            <FaEye />
                            View Details
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <motion.p
                className="text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                No booking requests found.
              </motion.p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BookingRequest;
