import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { IoArrowBackSharp } from "react-icons/io5";
import {
  MdPerson,
  MdDateRange,
  MdAccessTime,
  MdInfoOutline,
} from "react-icons/md";
import { FaEye } from "react-icons/fa";

const Checkin = () => {
  const [loading, setLoading] = useState(false);
  const [checkinDetails, setCheckinDetails] = useState([]);
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

  const fetchCheckinDetails = async () => {
    setLoading(true);
    try {
      const response = await window.electronAPI.sendToServer({
        action: "get_check_in_details",
      });
      const data = parseResponse(response.response);
      if (data.status === "success") {
        setCheckinDetails(data.checkin_details || []);
      } else {
        console.error("Failed to fetch check-in details:", data.message);
      }
    } catch (error) {
      console.error("Error fetching check-in details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCheckinDetails();
  }, []);

  const handleViewDetails = (checkinID) => {
    navigate(`/check-in-details/${checkinID}`);
  };

  return (
    <div className="bg-[#F3F4F6] min-h-screen">
      <div className="max-w-full mx-auto px-6 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
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
          <motion.div
            className="bg-white shadow-lg rounded-lg p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-xl font-bold mb-4 text-blue-600 flex items-center gap-2">
              <MdInfoOutline /> Check-in Details
            </h2>
            {checkinDetails.length > 0 ? (
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
                        <MdPerson className="inline-block mr-1 text-blue-500" />
                        Phone
                      </th>
                      <th className="text-left px-4 py-2 text-sm font-medium text-gray-600">
                        <MdDateRange className="inline-block mr-1 text-blue-500" />
                        Check-in
                      </th>
                      <th className="text-left px-4 py-2 text-sm font-medium text-gray-600">
                        <MdDateRange className="inline-block mr-1 text-blue-500" />
                        Check-out
                      </th>
                      <th className="text-left px-4 py-2 text-sm font-medium text-gray-600">
                        <MdAccessTime className="inline-block mr-1 text-blue-500" />
                        Duration
                      </th>
                      <th className="text-left px-4 py-2 text-sm font-medium text-gray-600">
                        Actions
                      </th>
                    </motion.tr>
                  </thead>
                  <tbody>
                    {checkinDetails.map((detail, idx) => (
                      <motion.tr
                        key={detail.CheckinDetailsID}
                        className="hover:bg-gray-50 cursor-pointer"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <td className="px-4 py-2 text-sm text-gray-800">
                          <MdPerson className="inline-block text-blue-500 mr-1" />
                          {detail.ClientName}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-800">
                          <MdPerson className="inline-block text-blue-500 mr-1" />
                          {detail.Phone}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-800">
                          <MdDateRange className="inline-block text-blue-500 mr-1" />
                          {detail.CheckinDate}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-800">
                          <MdDateRange className="inline-block text-blue-500 mr-1" />
                          {detail.CheckoutDate}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-800">
                          <MdAccessTime className="inline-block text-blue-500 mr-1" />
                          {detail.duration} nights
                        </td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() =>
                              handleViewDetails(detail.CheckinDetailsID)
                            }
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
                No check-in requests found.
              </motion.p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Checkin;
