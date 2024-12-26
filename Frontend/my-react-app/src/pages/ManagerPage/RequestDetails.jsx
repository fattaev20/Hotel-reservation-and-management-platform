import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { IoArrowBackSharp } from "react-icons/io5";
import { MdCheckCircle, MdAttachMoney, MdDateRange } from "react-icons/md";
import { FaUser, FaBed, FaPhone, FaChild } from "react-icons/fa";

const RequestDetails = () => {
  const { id } = useParams(); // Get BookingID from route params
  const [loading, setLoading] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [approveMessage, setApproveMessage] = useState(null);
  const [error, setError] = useState(null); // Error message state
  const navigate = useNavigate();

  // Function to parse the response and extract valid JSON
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

  // Fetch booking details on mount
  useEffect(() => {
    fetchBookingDetails(parseInt(id, 10));
  }, [id]);

  const fetchBookingDetails = async (bookingId) => {
    setLoading(true);
    try {
      const response = await window.electronAPI.sendToServer({
        action: "get_booking_request_by_id",
        BookingID: bookingId,
      });

      const data = parseResponse(response.response); // Extract and parse JSON
      if (data.status === "success") {
        setBookingDetails(data.booking_request || {});
        setError(null);
      } else {
        setError("Failed to fetch booking details.");
      }
    } catch (error) {
      console.error("Error fetching booking details:", error);
      setError("Error occurred while fetching booking details.");
    } finally {
      setLoading(false);
    }
  };

  const approveBookingRequest = async () => {
    setLoading(true);
    try {
      const response = await window.electronAPI.sendToServer({
        action: "approve_booking_requests",
        BookingID: parseInt(id, 10),
      });

      const data = parseResponse(response.response); // Extract and parse JSON
      if (data.status === "success") {
        setApproveMessage(data.message || "Booking approved successfully.");
        setBookingDetails((prev) => ({
          ...prev,
          PaymentStatus: "Approved",
        }));
      } else {
        setError(data.message || "Failed to approve booking.");
      }
    } catch (error) {
      console.error("Error approving booking:", error);
      setError("Error occurred while approving booking.");
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
            <h2 className="text-3xl font-bold mb-6 text-gray-800 ">
              Booking Request Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Booking Details */}
              <div className="flex items-center gap-4">
                <FaUser size={24} className="text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="text-lg font-medium text-gray-800">
                    {bookingDetails.Client?.FullName || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <FaPhone size={24} className="text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="text-lg font-medium text-gray-800">
                    {bookingDetails.Client?.Phone || "N/A"}
                  </p>
                </div>
              </div>
              {/* Other Details */}
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
                <FaChild size={24} className="text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Children</p>
                  <p className="text-lg font-medium text-gray-800">
                    {bookingDetails.ChildrenNumber || 0}
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
                <MdAttachMoney size={24} className="text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Total Cost</p>
                  <p className="text-lg font-medium text-gray-800">
                    ${bookingDetails.TotalPrice || 0}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <MdCheckCircle size={24} className="text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Payment Status</p>
                  <p className="text-lg font-medium text-gray-800">
                    {bookingDetails.PaymentStatus || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Approve Button */}
            <div className="mt-6">
              {bookingDetails.PaymentStatus === "Approved" ? (
                <p className="text-green-600 flex items-center gap-2">
                  Booking Already Approved <MdCheckCircle size={24} />
                </p>
              ) : (
                <motion.button
                  onClick={approveBookingRequest}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 transition-transform transform hover:scale-105 text-lg"
                  whileHover={{ scale: 1.05 }}
                >
                  Approve Booking
                </motion.button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.p
            className="text-gray-500 mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error || "No details found for this booking."}
          </motion.p>
        )}

        {/* Success/Error Modal */}
        {approveMessage && (
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
              <MdCheckCircle
                className="text-green-500 text-5xl mx-auto mb-4"
                aria-hidden="true"
              />
              <h2 className="text-2xl font-bold text-gray-800">Success</h2>
              <p className="text-gray-600 mt-2">{approveMessage}</p>
              <button
                onClick={() => {
                  setApproveMessage(null);
                  if (bookingDetails.PaymentStatus === "Approved") {
                    navigate(-1); // Return to previous page after approval
                  }
                }}
                className="mt-6 px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition-transform transform hover:scale-105"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default RequestDetails;
