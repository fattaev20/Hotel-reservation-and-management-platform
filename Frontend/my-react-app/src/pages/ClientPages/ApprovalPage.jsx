// PaymentSuccessPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MdClose, MdHome } from "react-icons/md";

export default function PaymentSuccessPage() {
  const navigate = useNavigate();

  // Example: Hard-coded booking ID (in practice, you’d retrieve it from payment logic or props)
  const bookingID = "12345";

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [bookingDetails, setBookingDetails] = useState(null);

  // ----------------------------------
  // 1) Open Modal & Fetch Booking
  // ----------------------------------
  async function handleOpenModal() {
    setIsModalOpen(true);
    setLoading(true);
    setErrorMessage("");
    setBookingDetails(null);

    try {
      // Build your request object
      const request = {
        action: "get_booking_request_by_id",
        BookingID: bookingID,
      };

      // Call backend via electron
      const result = await window.electronAPI.sendToServer(request);

      // Parse out the JSON (server might log lines before/after)
      const lines = result.response.split("\n");
      const jsonLine = lines.find((line) => line.trim().startsWith("{"));
      if (!jsonLine) {
        throw new Error("No JSON object found in server response.");
      }

      const parsed = JSON.parse(jsonLine.trim());
      if (parsed.status === "success") {
        // Adjust for your actual key => parsed.booking or parsed.booking_request
        if (parsed.booking) {
          setBookingDetails(parsed.booking);
        } else if (parsed.booking_request) {
          setBookingDetails(parsed.booking_request);
        } else {
          throw new Error("Booking data not found in server response.");
        }
      } else {
        throw new Error(parsed.message || "Failed to retrieve booking data.");
      }
    } catch (error) {
      setErrorMessage(
        error.message || "Something went wrong fetching booking."
      );
    } finally {
      setLoading(false);
    }
  }

  // ----------------------------------
  // 2) Close the modal
  // ----------------------------------
  function handleCloseModal() {
    setIsModalOpen(false);
  }

  // ----------------------------------
  // 3) Go to homepage
  // ----------------------------------
  function handleGoHome() {
    navigate("/");
  }

  // ----------------------------------
  // Render
  // ----------------------------------
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      {/* Main content card */}
      <div className="bg-white p-6 rounded shadow-md max-w-lg w-full text-center mb-6">
        <h1 className="text-2xl font-bold text-green-600 mb-4">
          Payment Successful!
        </h1>
        <p className="text-gray-700 mb-6">
          Your payment has been processed successfully. Thank you for booking
          with us!
        </p>

        {/* Buttons: View Details (Modal) & Go to Homepage */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <button
            onClick={handleOpenModal}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition"
          >
            View Booking Details
          </button>
          <button
            onClick={handleGoHome}
            className="px-4 py-2 bg-gray-500 text-white font-medium rounded hover:bg-gray-600 transition"
          >
            Go to Homepage
          </button>
        </div>
      </div>

      {/* MODAL (Shown if isModalOpen is true) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          {/* Modal Content */}
          <motion.div
            className="bg-white rounded-md shadow-lg w-full max-w-xl p-6 relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Close Button */}
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={handleCloseModal}
            >
              <MdClose size={24} />
            </button>

            <h2 className="text-xl font-bold text-center mb-4">
              Booking Details
            </h2>

            {/* Loading */}
            {loading && (
              <p className="text-center text-gray-600 animate-pulse">
                Fetching booking details...
              </p>
            )}

            {/* Error */}
            {errorMessage && !loading && (
              <p className="text-red-600 font-semibold text-center">
                {errorMessage}
              </p>
            )}

            {/* Booking Info */}
            {bookingDetails && !loading && !errorMessage && (
              <div className="mt-2 text-gray-700 space-y-2">
                <ul className="list-disc ml-4">
                  <li>
                    <strong>BookingID:</strong> {bookingDetails.BookingID}
                  </li>
                  <li>
                    <strong>Payment Status:</strong>{" "}
                    {bookingDetails.PaymentStatus || "N/A"}
                  </li>
                  <li>
                    <strong>Hotel ID:</strong> {bookingDetails.HotelID || "N/A"}
                  </li>
                  <li>
                    <strong>Check-in:</strong>{" "}
                    {bookingDetails.CheckinDate || "N/A"}
                  </li>
                  <li>
                    <strong>Check-out:</strong>{" "}
                    {bookingDetails.CheckoutDate || "N/A"}
                  </li>
                  <li>
                    <strong>Duration:</strong> {bookingDetails.Duration || 0}{" "}
                    nights
                  </li>
                  <li>
                    <strong>Room Number:</strong>{" "}
                    {bookingDetails.RoomNumber || "N/A"}
                  </li>
                  <li>
                    <strong>Adults:</strong> {bookingDetails.AdultsNumber || 0}
                  </li>
                  <li>
                    <strong>Children:</strong>{" "}
                    {bookingDetails.ChildrenNumber || 0}
                  </li>
                  <li>
                    <strong>Total Price:</strong> $
                    {bookingDetails.TotalPrice?.toFixed(2) || "0.00"}
                  </li>
                </ul>

                {/* Client Info */}
                <div className="mt-4 p-3 rounded bg-gray-50">
                  <h3 className="font-semibold mb-2">Client Information</h3>
                  <ul className="list-disc ml-5">
                    <li>
                      <strong>Client ID:</strong>{" "}
                      {bookingDetails.Client?.ClientID || "N/A"}
                    </li>
                    <li>
                      <strong>Full Name:</strong>{" "}
                      {bookingDetails.Client?.FullName || "N/A"}
                    </li>
                    <li>
                      <strong>Date of Birth:</strong>{" "}
                      {bookingDetails.Client?.DateOfBirth || "N/A"}
                    </li>
                    <li>
                      <strong>Address:</strong>{" "}
                      {bookingDetails.Client?.Address || "N/A"}
                    </li>
                    <li>
                      <strong>Phone:</strong>{" "}
                      {bookingDetails.Client?.Phone || "N/A"}
                    </li>
                    <li>
                      <strong>Passport Series:</strong>{" "}
                      {bookingDetails.Client?.PassportSeries || "N/A"}
                    </li>
                    <li>
                      <strong>Email:</strong>{" "}
                      {bookingDetails.Client?.Email || "N/A"}
                    </li>
                    <li>
                      <strong>Username:</strong>{" "}
                      {bookingDetails.Client?.Username || "N/A"}
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
