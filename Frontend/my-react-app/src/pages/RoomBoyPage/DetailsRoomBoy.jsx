import React, { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { IoArrowBackSharp } from "react-icons/io5";
import { MdCheckCircle, MdErrorOutline } from "react-icons/md";
import { FaUtensils, FaTools } from "react-icons/fa";
import { AiOutlineHome } from "react-icons/ai";

const DetailsRoomBoy = () => {
  const { id } = useParams(); // Room Number
  const { state } = useLocation(); // Retrieve CheckoutDetailsID
  const { CheckoutDetailsID } = state || {};
  const [RestaurantFee, setRestaurantFee] = useState("");
  const [BarFee, setBarFee] = useState("");
  const [RoomServiceFee, setRoomServiceFee] = useState("");
  const [MissingItems, setMissingItems] = useState("");
  const [BrokenItems, setBrokenItems] = useState("");
  const [AdditionalCosts, setAdditionalCosts] = useState("");
  const [modalVisible, setModalVisible] = useState(false); // Modal visibility state
  const [modalMessage, setModalMessage] = useState(""); // Modal message
  const [modalSuccess, setModalSuccess] = useState(false); // Modal success or error
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

  const handleCheckRoom = async () => {
    if (!CheckoutDetailsID) {
      alert("Missing CheckoutDetailsID!");
      return;
    }

    try {
      const response = await window.electronAPI.sendToServer({
        action: "update_checkout_details",
        CheckoutDetailsID,
        data: {
          RestaurantFee: parseFloat(RestaurantFee) || 0.0,
          BarFee: parseFloat(BarFee) || 0.0,
          RoomServiceFee: parseFloat(RoomServiceFee) || 0.0,
          MissingEquipment: MissingItems,
          BrokenEquipment: BrokenItems,
          AdditionalFee: parseFloat(AdditionalCosts) || 0.0,
        },
      });
      const data = parseResponse(response.response);
      if (data.status === "success") {
        setModalMessage(data.message || "Room checked successfully!");
        setModalSuccess(true);
      } else {
        setModalMessage(data.message || "Failed to check the room.");
        setModalSuccess(false);
      }
      setModalVisible(true);
    } catch (error) {
      console.error("Error checking room:", error);
      setModalMessage("An error occurred while checking the room.");
      setModalSuccess(false);
      setModalVisible(true);
    }
  };

  const closeModalAndReturn = () => {
    setModalVisible(false);
    if (modalSuccess) {
      navigate(-1);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-full mx-auto px-6 py-8">
        {/* Back Button */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg shadow hover:bg-gray-300 transition-transform transform hover:scale-105"
          >
            <IoArrowBackSharp size={20} />
            Back
          </button>
        </motion.div>

        {/* Room Details */}
        <motion.div
          className="bg-white shadow-xl rounded-lg p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-blue-600 flex items-center gap-2 mb-6">
            <AiOutlineHome size={28} />
            Room {id}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Additional Fees */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaUtensils className="text-blue-500" />
                Additional Fees
              </h3>
              <input
                type="number"
                placeholder="Restaurant fees"
                value={RestaurantFee}
                onChange={(e) => setRestaurantFee(e.target.value)}
                className="w-full px-4 py-2 mb-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Bar fees"
                value={BarFee}
                onChange={(e) => setBarFee(e.target.value)}
                className="w-full px-4 py-2 mb-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Room services fees"
                value={RoomServiceFee}
                onChange={(e) => setRoomServiceFee(e.target.value)}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {/* Missing & Broken Items */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaTools className="text-blue-500" />
                Missing and Broken Equipment
              </h3>
              <input
                type="text"
                placeholder="Missing items"
                value={MissingItems}
                onChange={(e) => setMissingItems(e.target.value)}
                className="w-full px-4 py-2 mb-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Broken items"
                value={BrokenItems}
                onChange={(e) => setBrokenItems(e.target.value)}
                className="w-full px-4 py-2 mb-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Additional costs"
                value={AdditionalCosts}
                onChange={(e) => setAdditionalCosts(e.target.value)}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <motion.button
            onClick={handleCheckRoom}
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-transform transform hover:scale-105"
            whileHover={{ scale: 1.05 }}
          >
            Done
          </motion.button>
        </motion.div>
      </div>

      {/* Modal */}
      {modalVisible && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full text-center">
            {modalSuccess ? (
              <MdCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
            ) : (
              <MdErrorOutline className="text-red-500 text-6xl mx-auto mb-4" />
            )}
            <h2 className="text-xl font-bold text-gray-800">
              {modalSuccess ? "Success" : "Error"}
            </h2>
            <p className="text-gray-600 mt-3">{modalMessage}</p>
            <button
              onClick={closeModalAndReturn}
              className="mt-6 px-6 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition-transform transform hover:scale-105"
            >
              OK
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DetailsRoomBoy;
