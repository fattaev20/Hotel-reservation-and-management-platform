import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MdLocationCity, MdOutlineArrowForwardIos } from "react-icons/md";
import { IoMdAlert, IoMdCheckmarkCircle } from "react-icons/io";

export default function ClientMain() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const navigate = useNavigate();

  // Called when user clicks "Continue"
  const handleNext = () => {
    if (!selectedCity) {
      alert("Please select a city first!");
      return;
    }
    // Navigate to /cityhotels/<selectedCity>
    navigate(`/cityhotels/${selectedCity}`);
    console.log("Selected city is:", selectedCity);
  };

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    setLoading(true);
    setResponseMessage("");

    try {
      const result = await window.electronAPI.sendToServer({
        action: "get_city",
      });
      const lines = result.response.split("\n");
      const jsonLine = lines
        .reverse()
        .find((line) => line.trim().startsWith("{"));
      if (!jsonLine) {
        throw new Error("No JSON object found in the server response.");
      }
      const parsed = JSON.parse(jsonLine.trim());
      if (parsed.status === "success" && Array.isArray(parsed.cities)) {
        setCities(parsed.cities);
      } else {
        setResponseMessage("No cities found.");
      }
    } catch (error) {
      setResponseMessage(`Error: ${error.message || "Something went wrong."}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] pt-6">
      <motion.div
        className="max-w-lg mx-auto  p-8 bg-white shadow-lg rounded-lg text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h1
          className="text-3xl font-extrabold mb-6 text-blue-700 flex items-center justify-center gap-3"
          initial={{ scale: 0.8, y: -10 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <MdLocationCity size={40} />
          Choose Your Destination
        </motion.h1>

        {/* Loading spinner */}
        {loading && (
          <motion.div
            className="flex justify-center items-center mb-6 text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2 text-lg font-medium">Fetching cities...</span>
          </motion.div>
        )}

        {/* Error or success message */}
        {responseMessage && (
          <motion.p
            className={`text-lg mb-4 ${
              responseMessage.startsWith("Error")
                ? "text-red-500 flex items-center gap-2"
                : "text-green-500 flex items-center gap-2"
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {responseMessage.startsWith("Error") ? (
              <IoMdAlert size={25} />
            ) : (
              <IoMdCheckmarkCircle size={25} />
            )}
            {responseMessage}
          </motion.p>
        )}

        {/* City selection dropdown */}
        {!loading && cities.length > 0 && (
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <label className="block text-lg font-medium text-gray-700 mb-3">
              Select a city to explore
            </label>
            <motion.select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full p-4 text-gray-600 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              whileFocus={{ scale: 1.02 }}
            >
              <option value="">Choose a city</option>
              {cities.map((city, idx) => (
                <option key={idx} value={city}>
                  {city}
                </option>
              ))}
            </motion.select>
          </motion.div>
        )}

        {/* Continue button */}
        <motion.button
          onClick={handleNext}
          disabled={loading}
          className={`w-full flex items-center justify-center gap-3 py-3 rounded-lg shadow-md text-lg font-bold ${
            selectedCity
              ? "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:scale-105"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          } transition-all`}
          whileTap={{ scale: selectedCity ? 0.95 : 1 }}
        >
          Continue <MdOutlineArrowForwardIos />
        </motion.button>
      </motion.div>
    </div>
  );
}
