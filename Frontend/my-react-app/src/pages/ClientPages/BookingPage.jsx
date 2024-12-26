import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const BookingPage = () => {
  const navigate = useNavigate();

  // State for booking details
  const [bookingDetails, setBookingDetails] = useState({
    ClientID: hotelID, // Replace with actual ClientID
    HotelID: hotelID,
    CheckinDate: "",
    CheckoutDate: "",
    AdultsNumber: 1,
    ChildrenNumber: 0,
    RoomType: "",
  });

  useEffect(() => {
    // Retrieve hotel details from localStorage and set relevant fields
    const storedHotelDetails = localStorage.getItem("hotelDetails");
    if (storedHotelDetails) {
      const hotelDetails = JSON.parse(storedHotelDetails);

      setBookingDetails((prevDetails) => ({
        ...prevDetails,
        HotelID: hotelDetails.hotel?.HotelID || 0,
        RoomType: hotelDetails.room_types?.[0]?.TypeID || "", // Default to first room type
      }));
    }
  }, []);

  // Handle input changes for user-entered fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookingDetails({ ...bookingDetails, [name]: value });
  };

  const handleReservation = async () => {
    try {
      const response = await window.electronAPI.sendToServer({
        action: "booking",
        data: bookingDetails,
      });

      const parsedResponse = JSON.parse(response.response);
      console.log(parsedResponse);
      if (parsedResponse.status === "success") {
        alert("Booking successful!");
        navigate("/payment", { state: { bookingDetails: parsedResponse } });
      } else {
        alert(parsedResponse.message || "Booking failed!");
      }
    } catch (error) {
      console.error("Error during booking:", error);
      alert("An error occurred while making the booking.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold text-center mb-6">Booking Portal</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        {/* Check-in Date */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Check-in Date</label>
          <input
            type="date"
            name="CheckinDate"
            value={bookingDetails.CheckinDate}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Check-out Date */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Check-out Date</label>
          <input
            type="date"
            name="CheckoutDate"
            value={bookingDetails.CheckoutDate}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Adults and Children */}
        <div className="flex space-x-4 mb-4">
          <div>
            <label className="block text-gray-700 mb-2">Adults</label>
            <input
              type="number"
              name="AdultsNumber"
              value={bookingDetails.AdultsNumber}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              min="1"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Children</label>
            <input
              type="number"
              name="ChildrenNumber"
              value={bookingDetails.ChildrenNumber}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              min="0"
            />
          </div>
        </div>

        {/* Room Type */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Type of Room</label>
          <select
            name="RoomType"
            value={bookingDetails.RoomType}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            {localStorage.getItem("hotelDetails") &&
              JSON.parse(localStorage.getItem("hotelDetails")).room_types?.map(
                (room) => (
                  <option key={room.TypeID} value={room.TypeID}>
                    {room.Name}
                  </option>
                )
              )}
          </select>
        </div>

        {/* Reserve Button */}
        <button
          onClick={handleReservation}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full"
        >
          Reserve
        </button>
      </div>
    </div>
  );
};

export default BookingPage;
