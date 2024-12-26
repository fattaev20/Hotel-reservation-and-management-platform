import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MdOutlineHotel,
  MdAccessTime,
  MdCheckCircle,
  MdError,
} from "react-icons/md";

const RoomBoyMain = () => {
  const [loading, setLoading] = useState(false);
  const [roomDetails, setRoomDetails] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All"); // Filter state
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
      console.error("Raw Response:", response);
      throw new Error("No valid JSON object found in response.");
    }
    return JSON.parse(jsonLine.trim());
  };

  const fetchRoomDetails = async () => {
    setLoading(true);
    try {
      const response = await window.electronAPI.sendToServer({
        action: "get_room_details_for_room_boy",
      });
      const data = parseResponse(response.response);

      if (data.status === "success") {
        // Sort unchecked rooms first
        const sortedRooms = data.data.sort((a, b) =>
          a.CheckStatus === "Not checked" && b.CheckStatus === "checked"
            ? -1
            : 0
        );
        setRoomDetails(sortedRooms || []);
      } else {
        console.error("Failed to fetch room details:", data.message);
      }
    } catch (error) {
      console.error("Error fetching room details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomDetails();
  }, []);

  const handleCheckRoom = (roomNumber, checkoutDetailsId) => {
    navigate(`/room-details/${roomNumber}`, {
      state: { CheckoutDetailsID: checkoutDetailsId },
    });
  };

  const filteredRooms = roomDetails.filter((room) => {
    if (filterStatus === "All") return true;
    return filterStatus === "Checked"
      ? room.CheckStatus === "checked"
      : room.CheckStatus === "Not checked";
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-full mx-auto px-8 py-8">
        {/* Page Title */}
        <motion.h1
          className="text-4xl font-extrabold text-blue-600 flex items-center gap-2 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <MdOutlineHotel size={36} /> Room Details
        </motion.h1>

        {/* Filter Dropdown */}
        <div className="flex justify-between items-center mb-6">
          <label className="text-gray-700 font-medium flex items-center gap-2">
            <span>Filter by Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300 focus:outline-none"
            >
              <option value="All">All</option>
              <option value="Checked">Checked</option>
              <option value="Not checked">Not Checked</option>
            </select>
          </label>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <motion.div
            className="flex flex-col justify-center items-center py-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="mt-4 text-lg text-gray-600">Loading rooms...</span>
          </motion.div>
        ) : (
          <motion.div
            className="bg-white shadow-xl rounded-lg overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {filteredRooms.length > 0 ? (
              <div className="overflow-auto">
                <table className="min-w-full table-auto border-collapse">
                  <thead>
                    <tr className="bg-blue-50">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-blue-800">
                        Room Number
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-blue-800">
                        Room Type
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-blue-800">
                        Checkout Time
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-blue-800">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-blue-800">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRooms.map((room, idx) => (
                      <motion.tr
                        key={room.RoomNumber}
                        className="hover:bg-blue-50 cursor-pointer transition-colors duration-200"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                          {room.RoomNumber}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {room.Name}
                        </td>
                        <td className="px-6 py-6 text-sm text-gray-700 flex items-center gap-1">
                          <MdAccessTime className="text-blue-500" />
                          {room.CheckOutTime}
                        </td>

                        <td className="px-6 py-2">
                          <td className="flex items-center gap-2">
                            {room.CheckStatus === "checked" ? (
                              <MdCheckCircle className="text-green-500" />
                            ) : (
                              <MdError className="text-red-500" />
                            )}
                            {room.CheckStatus}
                          </td>
                        </td>
                        <td className="px-6 py-4">
                          {room.CheckStatus === "checked" ? (
                            <p className="text-blue-600 flex items-center gap-[5px]">
                              Checked!
                              <MdCheckCircle className="text-green-500" />
                            </p>
                          ) : (
                            <button
                              onClick={() =>
                                handleCheckRoom(
                                  room.RoomNumber,
                                  room.CheckoutDetailsID
                                )
                              }
                              className="bg-blue-600 p-2 rounded-lg text-white flex items-center gap-2 transition-transform transform hover:scale-105 font-medium"
                            >
                              Check Room
                            </button>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <motion.p
                className="text-gray-500 text-center py-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                No rooms found.
              </motion.p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RoomBoyMain;
