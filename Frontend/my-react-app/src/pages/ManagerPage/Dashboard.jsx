import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MdInfo, MdClose } from "react-icons/md";

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [bookingRequests, setBookingRequests] = useState([]);
  const [checkInDetails, setCheckInDetails] = useState([]);
  const [checkOutDetails, setCheckOutDetails] = useState([]);
  const [modalData, setModalData] = useState(null); // Data to display in modal
  const navigate = useNavigate();

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

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

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const bookingResponse = await window.electronAPI.sendToServer({
        action: "get_booking_request",
      });
      const checkInResponse = await window.electronAPI.sendToServer({
        action: "get_check_in_details",
      });
      const checkOutResponse = await window.electronAPI.sendToServer({
        action: "get_check_out_details",
      });

      // Process responses
      const parsedBooking = parseResponse(bookingResponse.response);
      const parsedCheckIn = parseResponse(checkInResponse.response);
      const parsedCheckOut = parseResponse(checkOutResponse.response);

      if (parsedBooking.status === "success") {
        setBookingRequests(parsedBooking.booking_requests || []);
      }

      if (parsedCheckIn.status === "success") {
        setCheckInDetails(parsedCheckIn.checkin_details || []);
      }

      if (parsedCheckOut.status === "success") {
        setCheckOutDetails(parsedCheckOut.checkout_details || []);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (data) => {
    setModalData(data);
  };

  const closeModal = () => {
    setModalData(null);
  };

  const handleShowMore = (type) => {
    navigate(`/${type}`);
  };

  return (
    <div className="bg-[#F3F4F6] min-h-screen">
      <div className="max-w-full mx-auto px-6 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-6">
            <motion.div
              className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Section
              title="Booking Requests"
              icon={<MdInfo className="text-blue-500 text-xl" />}
              data={bookingRequests}
              columns={["Client.FullName", "CheckinDate", "CheckoutDate"]}
              onShowMore={() => handleShowMore("booking-requests")}
              onDetails={(row) => openModal(row)}
            />
            <Section
              title="Check-In Details"
              icon={<MdInfo className="text-green-500 text-xl" />}
              data={checkInDetails}
              columns={["ClientName", "Phone", "CheckinDate", "CheckoutDate"]}
              onShowMore={() => handleShowMore("check-in-details")}
              onDetails={(row) => openModal(row)}
            />
            <Section
              title="Check-Out Details"
              icon={<MdInfo className="text-red-500 text-xl" />}
              data={checkOutDetails}
              columns={["ClientName", "CheckinDate", "CheckoutDate"]}
              onShowMore={() => handleShowMore("check-out-details")}
              onDetails={(row) => openModal(row)}
            />
          </motion.div>
        )}
      </div>

      {/* Modal for detailed data */}
      <AnimatePresence>
        {modalData && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto relative"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              {/* Close Button */}
              <button
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-transform transform hover:scale-110"
                onClick={closeModal}
              >
                <MdClose className="text-2xl" />
              </button>

              {/* Title */}
              <h2 className="text-2xl font-bold mb-4 text-blue-600 flex items-center gap-2">
                <MdInfo className="text-blue-500" /> Detailed Information
              </h2>

              {/* Booking Details */}
              <div className="space-y-4">
                {Object.entries(modalData).map(([key, value]) => {
                  // Handle Client field separately
                  if (key === "Client" && typeof value === "string") {
                    try {
                      const clientData = JSON.parse(value); // Parse the Client JSON string
                      return (
                        <div key={key} className="space-y-2">
                          <p className="text-lg font-semibold text-gray-700">
                            <MdPerson className="inline-block text-blue-500" />{" "}
                            Client Details:
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {Object.entries(clientData).map(
                              ([clientKey, clientValue]) => (
                                <div
                                  key={clientKey}
                                  className="flex justify-between bg-gray-100 rounded-lg px-4 py-2 shadow-sm"
                                >
                                  <p className="text-sm font-medium text-gray-600 capitalize flex items-center gap-2">
                                    <MdInfo className="text-gray-500" />
                                    {clientKey.replace(/([A-Z])/g, " $1")}:
                                  </p>
                                  <p className="text-sm text-gray-700 font-semibold truncate">
                                    {clientValue || "N/A"}
                                  </p>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      );
                    } catch (error) {
                      console.error("Error parsing Client field:", error);
                      return (
                        <p key={key} className="text-red-500 text-sm font-bold">
                          Unable to parse Client details.
                        </p>
                      );
                    }
                  }

                  // Default rendering for other fields
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between bg-gray-100 rounded-lg px-4 py-2 shadow-sm"
                    >
                      <p className="text-sm font-medium text-gray-600 capitalize flex items-center gap-2">
                        <MdInfo className="text-gray-500" />
                        {key.replace(/([A-Z])/g, " $1")}:
                      </p>
                      <p className="text-sm text-gray-700 font-semibold truncate">
                        {typeof value === "object"
                          ? JSON.stringify(value)
                          : value || "N/A"}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Close Button */}
              <div className="flex justify-center mt-6">
                <motion.button
                  onClick={closeModal}
                  className="px-6 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition-transform transform hover:scale-105"
                  whileHover={{ scale: 1.05 }}
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Section Component for displaying data
const Section = ({ title, icon, data, columns, onShowMore, onDetails }) => {
  return (
    <motion.div
      className="bg-white shadow-md rounded-lg p-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          {icon} {title}
        </h2>
        <button
          onClick={onShowMore}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-transform transform hover:scale-105"
        >
          Show More
        </button>
      </div>
      {data.length > 0 ? (
        <div className="overflow-auto">
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100">
                {columns.map((col) => (
                  <th
                    key={col}
                    className="text-left px-4 py-2 text-sm font-medium text-gray-600"
                  >
                    {col.split(".").pop()}
                  </th>
                ))}
                <th className="text-left px-4 py-2 text-sm font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <motion.tr
                  key={idx}
                  className="hover:bg-gray-50 cursor-pointer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  {columns.map((col) => {
                    const keys = col.split(".");
                    const value =
                      keys.length > 1
                        ? keys.reduce((acc, key) => acc?.[key], row)
                        : row[col];
                    return (
                      <td key={col} className="px-4 py-2 text-sm text-gray-800">
                        {value || "N/A"}
                      </td>
                    );
                  })}
                  <td className="px-4 py-2">
                    <button
                      onClick={() => onDetails(row)}
                      className="text-blue-500 hover:text-blue-700 transition-transform transform hover:scale-105"
                    >
                      Details
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500">No data available.</p>
      )}
    </motion.div>
  );
};

export default Dashboard;
