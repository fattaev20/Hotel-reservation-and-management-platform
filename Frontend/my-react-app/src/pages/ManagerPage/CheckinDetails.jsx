import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { IoArrowBackSharp } from "react-icons/io5";
import {
  FaUser,
  FaPhone,
  FaBed,
  FaChild,
  FaMoneyBillWave,
} from "react-icons/fa";
import { MdDateRange, MdCheckCircle } from "react-icons/md";

const CheckinDetails = () => {
  const { id } = useParams(); // Get CheckinDetailsID from route params
  const [loading, setLoading] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [message, setMessage] = useState(null); // For displaying messages from API
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
      console.error("Raw Response:", response); // Log the raw response for debugging
      throw new Error("No valid JSON object found in response.");
    }
    return JSON.parse(jsonLine.trim());
  };

  useEffect(() => {
    fetchCheckinDetails(parseInt(id, 10));
  }, [id]);

  const fetchCheckinDetails = async (checkinID) => {
    setLoading(true);
    try {
      const response = await window.electronAPI.sendToServer({
        action: "get_check_in_details_by_id",
        CheckinDetailsID: checkinID,
      });

      const data = parseResponse(response.response);
      if (data.status === "success") {
        setBookingDetails(data.check_in_details || {}); // Correct key
      } else {
        setMessage(data.message || "Failed to fetch check-in details.");
      }
    } catch (error) {
      console.error("Error fetching check-in details:", error);
      setMessage("An error occurred while fetching the details.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setLoading(true);
    try {
      const response = await window.electronAPI.sendToServer({
        action: "approve_check_in_details",
        CheckinDetailsID: bookingDetails.CheckinDetailsID,
      });
      const data = parseResponse(response.response);
      setMessage(data.message || "Check-in approved successfully.");
    } catch (error) {
      console.error("Error approving check-in:", error);
      setMessage("An error occurred while approving the check-in.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    try {
      const response = await window.electronAPI.sendToServer({
        action: "cancel_check_in",
        CheckinDetailsID: bookingDetails.CheckinDetailsID,
      });
      const data = parseResponse(response.response);
      setMessage(data.message || "Check-in canceled successfully.");
    } catch (error) {
      console.error("Error canceling check-in:", error);
      setMessage("An error occurred while canceling the check-in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F3F4F6] min-h-screen">
      <motion.div
        className="max-w-full mx-auto px-6 py-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Back Button */}
        <motion.button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg shadow hover:bg-gray-300 transition-transform transform hover:scale-105"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <IoArrowBackSharp size={20} />
          Back
        </motion.button>

        {/* Content */}
        {loading ? (
          <motion.div
            className="flex justify-center items-center py-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </motion.div>
        ) : bookingDetails ? (
          <motion.div
            className="bg-white shadow-lg rounded-lg p-8 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-6 text-gray-800">
              Check-in Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4">
                <FaUser size={24} className="text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Client Name</p>
                  <p className="text-lg font-medium text-gray-800">
                    {bookingDetails.ClientName || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <FaPhone size={24} className="text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="text-lg font-medium text-gray-800">
                    {bookingDetails.Phone || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <MdDateRange size={24} className="text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Check-in</p>
                  <p className="text-lg font-medium text-gray-800">
                    {bookingDetails.CheckinDate || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <MdDateRange size={24} className="text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Check-out</p>
                  <p className="text-lg font-medium text-gray-800">
                    {bookingDetails.CheckoutDate || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <FaBed size={24} className="text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Room Number</p>
                  <p className="text-lg font-medium text-gray-800">
                    {bookingDetails.RoomNumber || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <FaChild size={24} className="text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Children</p>
                  <p className="text-lg font-medium text-gray-800">
                    {bookingDetails.ChildrenNumber || 0}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <FaMoneyBillWave size={24} className="text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Total Cost</p>
                  <p className="text-lg font-medium text-gray-800">
                    ${bookingDetails.TotalCost || 0}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <MdCheckCircle size={24} className="text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Payment Status</p>
                  <p className="text-lg font-medium text-gray-800">
                    {bookingDetails.PaymentStatus || "Pending"}
                  </p>
                </div>
              </div>
            </div>

            {message && (
              <motion.div
                className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full text-center"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <MdCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-800">Success</h2>
                  <p className="text-gray-600 mt-2">{message}</p>
                  <button
                    onClick={() => setMessage(null)}
                    className="mt-6 px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition-transform transform hover:scale-105"
                  >
                    Close
                  </button>
                </motion.div>
              </motion.div>
            )}

            <div className="flex space-x-4 mt-6">
              <motion.button
                onClick={handleApprove}
                className="px-6 py-3 bg-green-500 text-white rounded-lg shadow-lg hover:bg-green-600 transition-transform transform hover:scale-105 text-lg"
                whileHover={{ scale: 1.05 }}
              >
                Approve Check-in
              </motion.button>
              <motion.button
                onClick={handleCancel}
                className="px-6 py-3 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 transition-transform transform hover:scale-105 text-lg"
                whileHover={{ scale: 1.05 }}
              >
                Cancel Check-in
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.p
            className="text-gray-500 mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            No details found for this check-in.
          </motion.p>
        )}
      </motion.div>
    </div>
  );
};

export default CheckinDetails;
