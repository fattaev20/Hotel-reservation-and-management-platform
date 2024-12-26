import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { IoArrowBackSharp } from "react-icons/io5";
import { MdCheckCircle, MdAttachMoney, MdDateRange } from "react-icons/md";
import { FaUser, FaBed, FaPhone, FaChild } from "react-icons/fa";

const CheckoutDetails = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [checkoutDetails, setCheckoutDetails] = useState(null);
  const [message, setMessage] = useState(null);
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

  const fetchCheckoutDetailsByID = async (checkoutID) => {
    setLoading(true);
    try {
      const response = await window.electronAPI.sendToServer({
        action: "get_check_out_details_by_id",
        CheckoutDetailsID: checkoutID,
      });
      const data = parseResponse(response.response);
      if (data.status === "success") {
        setCheckoutDetails(data.checkout_details || {});
      } else {
        setMessage("Failed to fetch checkout details.");
      }
    } catch (error) {
      console.error("Error fetching checkout details:", error);
      setMessage("Error occurred while fetching checkout details.");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveCheckout = async () => {
    setLoading(true);
    try {
      const response = await window.electronAPI.sendToServer({
        action: "approve_check_out_details",
        CheckoutDetailsID: checkoutDetails.CheckoutDetailsID,
      });
      const data = parseResponse(response.response);
      setMessage(data.message || "Checkout approved successfully.");
    } catch (error) {
      console.error("Error approving checkout:", error);
      setMessage("Error occurred while approving checkout.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCheckoutDetailsByID(parseInt(id, 10));
  }, [id]);

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
        ) : checkoutDetails ? (
          <motion.div
            className="bg-white shadow-lg rounded-lg p-8 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-6 text-gray-800">
              Checkout Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4">
                <FaUser size={24} className="text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Client Name</p>
                  <p className="text-lg font-medium text-gray-800">
                    {checkoutDetails.ClientName || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <FaPhone size={24} className="text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="text-lg font-medium text-gray-800">
                    {checkoutDetails.Phone || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <MdDateRange size={24} className="text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Check-in</p>
                  <p className="text-lg font-medium text-gray-800">
                    {checkoutDetails.CheckinDate || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <MdDateRange size={24} className="text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Check-out</p>
                  <p className="text-lg font-medium text-gray-800">
                    {checkoutDetails.CheckoutDate || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <FaChild size={24} className="text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Children</p>
                  <p className="text-lg font-medium text-gray-800">
                    {checkoutDetails.ChildrenNumber || 0}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <FaBed size={24} className="text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Room Number</p>
                  <p className="text-lg font-medium text-gray-800">
                    {checkoutDetails.RoomNumber || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <MdAttachMoney size={24} className="text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Total Cost</p>
                  <p className="text-lg font-medium text-gray-800">
                    ${checkoutDetails.CheckoutTotalPrice?.toFixed(2) || 0}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <MdCheckCircle size={24} className="text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Payment Status</p>
                  <p className="text-lg font-medium text-gray-800">
                    {checkoutDetails.CheckStatus || "N/A"}
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

            <div className="mt-6">
              <motion.button
                onClick={handleApproveCheckout}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 transition-transform transform hover:scale-105 text-lg"
                whileHover={{ scale: 1.05 }}
              >
                Approve Checkout
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.p
            className="text-gray-500 mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            No details found for this checkout.
          </motion.p>
        )}
      </motion.div>
    </div>
  );
};

export default CheckoutDetails;
