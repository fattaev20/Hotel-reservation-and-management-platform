import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom"; // <-- Note useLocation
import { motion } from "framer-motion";
import {
  MdArrowBack,
  MdWifi,
  MdFreeBreakfast,
  MdStar,
  MdPhone,
  MdLocationOn,
  MdOutlineKingBed,
} from "react-icons/md";

const HotelInfo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // <--- useLocation hook
  const { hotelImage } = location.state || {}; // <--- get the image from state

  const [hotelDetails, setHotelDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [bookingDetails, setBookingDetails] = useState({
    ClientID: 0,
    HotelID: 0,
    CheckinDate: "",
    CheckoutDate: "",
    AdultsNumber: 1,
    ChildrenNumber: 0,
    RoomType: 0,
  });

  useEffect(() => {
    if (id) {
      fetchHotelDetails(parseInt(id, 10));
    }

    // Get userData from localStorage
    const storedUserData = localStorage.getItem("userData");
    const userData = storedUserData ? JSON.parse(storedUserData) : {};
    setBookingDetails((prevDetails) => ({
      ...prevDetails,
      ClientID: userData.id || 0,
    }));
  }, [id]);

  const fetchHotelDetails = async (hotelID) => {
    setLoading(true);
    setErrorMessage("");

    const request = {
      action: "get_hotel_data",
      HotelID: hotelID,
    };

    try {
      const result = await window.electronAPI.sendToServer(request);
      const lines = result.response.split("\n");
      const jsonLine = lines.find((line) => line.trim().startsWith("{"));
      if (!jsonLine) {
        throw new Error("No JSON object found in the server response.");
      }
      const parsed = JSON.parse(jsonLine.trim());

      if (parsed.status === "success") {
        setHotelDetails(parsed);
        setBookingDetails((prevDetails) => ({
          ...prevDetails,
          HotelID: parsed.hotel?.HotelID || 0,
          RoomType: parsed.room_types?.[0]?.TypeID || "",
        }));
      } else {
        setErrorMessage(parsed.message || "Hotel not found.");
      }
    } catch (error) {
      setErrorMessage(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    try {
      const response = await window.electronAPI.sendToServer({
        action: "booking",
        ...bookingDetails,
      });

      const lines = response.response.split("\n");
      const jsonLine = lines.find((line) => line.trim().startsWith("{"));
      if (!jsonLine) {
        throw new Error("No JSON object found in the server response.");
      }
      const parsedResponse = JSON.parse(jsonLine.trim());

      if (parsedResponse.status === "success") {
        alert("Booking successful!");
        // Navigate to /payment, passing along booking details
        navigate("/payment", { state: { bookingDetails: parsedResponse } });
        setIsModalOpen(false);
      } else {
        alert(parsedResponse.message || "Booking failed!");
      }
    } catch (error) {
      console.error("Error during booking:", error);
      alert("An error occurred while making the booking.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookingDetails({ ...bookingDetails, [name]: value });
  };

  const handleBack = () => {
    navigate(-1);
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.div
        className="max-w-7xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Back Button */}
        <div
          className="mb-6 flex items-center gap-4 cursor-pointer"
          onClick={handleBack}
        >
          <MdArrowBack size={30} className="text-gray-600" />
          <span className="text-gray-600 text-lg font-medium">Back</span>
        </div>

        {/* Loading / Error states */}
        {loading && (
          <p className="text-center text-gray-500 animate-pulse">
            Loading hotel details…
          </p>
        )}
        {errorMessage && (
          <p className="text-center text-red-500">{errorMessage}</p>
        )}

        {/* Hotel Details */}
        {hotelDetails ? (
          <div>
            <div className="flex flex-col lg:flex-row justify-between items-start mb-8">
              {/* Left column: Image + Basic Info */}
              <div className="w-full lg:w-1/2">
                <img
                  src={
                    hotelImage ||
                    "https://via.placeholder.com/600x400?text=No+Image"
                  }
                  alt={`Hotel ID ${id}`}
                  className="w-full h-80 object-cover rounded-lg"
                />
                <h1 className="text-3xl font-bold text-gray-800 mt-4">
                  {hotelDetails.hotel.Name}
                </h1>
                <div className="text-gray-600 flex items-center gap-2 mb-2 mt-2">
                  <MdLocationOn size={20} />
                  {hotelDetails.hotel.Address}
                </div>
                <div className="text-gray-600 flex items-center gap-2">
                  <MdPhone size={20} />
                  {hotelDetails.hotel.Phone}
                </div>
              </div>

              {/* Right column: Booking + Rating + Facilities */}
              <div className="w-full lg:w-1/3 flex flex-col gap-4 mt-6 lg:mt-0">
                <button
                  onClick={openModal}
                  className="bg-blue-600 text-white py-3 px-5 rounded-lg text-lg font-semibold hover:bg-blue-700"
                >
                  Book
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-medium">Rating:</span>
                  <div className="flex items-center text-yellow-500 text-xl">
                    {Array.from({ length: 5 }, (_, i) => (
                      <MdStar
                        key={i}
                        className={
                          i < hotelDetails.hotel.Stars ? "" : "text-gray-300"
                        }
                      />
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-bold">Facilities:</h3>
                  <ul className="list-none text-gray-700 space-y-2">
                    {hotelDetails.hotel.Facilities.split(", ").map(
                      (facility, index) => (
                        <li key={index} className="flex items-center gap-2">
                          {facility.includes("WiFi") && (
                            <MdWifi className="text-blue-600" />
                          )}
                          {facility.includes("Breakfast") && (
                            <MdFreeBreakfast className="text-yellow-600" />
                          )}
                          {facility}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* Overview */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Overview</h2>
              <p className="text-gray-700 leading-relaxed">
                {hotelDetails.hotel.Description ||
                  "No description available for this hotel."}
              </p>
            </div>

            {/* Room Types */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Room Types</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hotelDetails.room_types.map((room) => (
                  <div
                    key={room.TypeID}
                    className="p-6 bg-gray-100 border rounded-lg shadow-md hover:shadow-lg"
                  >
                    <div className="flex items-center mb-3">
                      <MdOutlineKingBed
                        size={30}
                        className="text-blue-600 mr-3"
                      />
                      <h3 className="text-xl font-semibold text-gray-800">
                        {room.Name}
                      </h3>
                    </div>
                    <p className="text-gray-600 mb-3">{room.Description}</p>
                    <div className="text-gray-700 font-medium mb-2">
                      Adults: ${room.PriceAdults} | Children: $
                      {room.PriceChildren} | Babies:{" "}
                      {room.PriceBabies || "Free"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // No Hotel Data
          <div className="text-center py-20">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              No Hotel Data Found
            </h2>
            <p className="text-gray-600 text-lg">
              Sorry, we couldn’t find any details for this hotel.
            </p>
          </div>
        )}
      </motion.div>

      {/* Modal */}
      {isModalOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-2xl relative"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
          >
            <h2 className="text-3xl font-extrabold mb-8 text-gray-800 text-center">
              Reserve Your Stay
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-lg font-bold mb-2">
                  Check-in Date
                </label>
                <input
                  type="date"
                  name="CheckinDate"
                  value={bookingDetails.CheckinDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-xl"
                />
                <label className="block text-lg font-bold mt-6 mb-2">
                  Check-out Date
                </label>
                <input
                  type="date"
                  name="CheckoutDate"
                  value={bookingDetails.CheckoutDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-xl"
                />
              </div>
              <div>
                <label className="block text-lg font-bold mb-2">Adults</label>
                <input
                  type="number"
                  name="AdultsNumber"
                  value={bookingDetails.AdultsNumber}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-3 border rounded-xl"
                />
                <label className="block text-lg font-bold mt-6 mb-2">
                  Children
                </label>
                <input
                  type="number"
                  name="ChildrenNumber"
                  value={bookingDetails.ChildrenNumber}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-3 border rounded-xl"
                />
                <label className="block text-lg font-bold mt-6 mb-2">
                  Type of Room
                </label>
                <select
                  name="RoomType"
                  value={bookingDetails.RoomType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-xl"
                >
                  {hotelDetails.room_types.map((room) => (
                    <option key={room.TypeID} value={room.TypeID}>
                      {room.Name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-10 flex justify-end gap-6">
              <button
                onClick={closeModal}
                className="px-6 py-3 bg-gray-300 text-gray-800 rounded-xl hover:bg-gray-400"
              >
                Cancel
              </button>
              <motion.button
                onClick={handleBooking}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-700 text-white text-lg rounded-xl hover:from-green-700 hover:to-green-800"
                whileHover={{ scale: 1.05 }}
              >
                Confirm Booking
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default HotelInfo;
