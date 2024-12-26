import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MdCreditCard,
  MdCalendarToday,
  MdMoneyOff,
  MdCheckCircle,
} from "react-icons/md";

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { bookingDetails } = location.state || {};

  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    paymentMethod: "pay full price", // Default payment method
  });

  const handlePaymentMethod = (method) => {
    setPaymentDetails((prev) => ({ ...prev, paymentMethod: method }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails({ ...paymentDetails, [name]: value });
  };

  const handlePayment = async () => {
    if (
      !paymentDetails.cardNumber ||
      !paymentDetails.expiryMonth ||
      !paymentDetails.expiryYear ||
      !paymentDetails.cvv
    ) {
      alert("Please fill out all payment details.");
      return;
    }

    try {
      const response = await window.electronAPI.sendToServer({
        action: "payment",
        BookingID: bookingDetails.BookingID,
        PaymentMethod: paymentDetails.paymentMethod,
        Amount:
          paymentDetails.paymentMethod === "pay full price"
            ? bookingDetails.TotalPrice
            : bookingDetails.TotalPrice * 0.3,
      });

      const lines = response.response.split("\n");
      const jsonLine = lines.find((line) => line.trim().startsWith("{"));
      if (!jsonLine) {
        throw new Error("No JSON object found in the server response.");
      }
      const parsedResponse = JSON.parse(jsonLine.trim());

      if (parsedResponse.status === "success") {
        navigate("/approval", {
          state: { bookingDetails, paymentResponse: parsedResponse },
        });
      } else {
        alert(parsedResponse.message || "Payment failed!");
      }
    } catch (error) {
      console.error("Error during payment:", error);
      alert("An error occurred while processing the payment.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <motion.div
        className="max-w-6xl mx-auto mt-10 p-8 bg-white shadow-lg rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-extrabold text-center text-blue-700 mb-8">
          Payment
        </h1>
        <div className="flex flex-wrap md:flex-nowrap justify-between gap-8">
          {/* Payment Inputs */}
          <div className="w-full md:w-2/3">
            <h2 className="text-xl font-bold mb-4">Payment Details</h2>
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => handlePaymentMethod("pay full price")}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition ${
                  paymentDetails.paymentMethod === "pay full price"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                <MdMoneyOff /> Pay Full Cost
              </button>
              <button
                onClick={() => handlePaymentMethod("pay 30%")}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition ${
                  paymentDetails.paymentMethod === "pay 30%"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                <MdMoneyOff /> Pay 30%
              </button>
            </div>

            <label className="block text-gray-700 font-medium mb-2">
              Card Number
            </label>
            <input
              type="text"
              name="cardNumber"
              value={paymentDetails.cardNumber}
              onChange={handleChange}
              placeholder="XXXX XXXX XXXX XXXX"
              className="w-full border rounded-lg px-4 py-3 mb-6"
            />

            <div className="flex space-x-4 mb-6">
              <div className="w-1/3">
                <label className="block text-gray-700 font-medium mb-2">
                  Expiration Date
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    name="expiryMonth"
                    value={paymentDetails.expiryMonth}
                    onChange={handleChange}
                    placeholder="MM"
                    className="w-1/2 border rounded-lg px-4 py-3"
                  />
                  <input
                    type="text"
                    name="expiryYear"
                    value={paymentDetails.expiryYear}
                    onChange={handleChange}
                    placeholder="YY"
                    className="w-1/2 border rounded-lg px-4 py-3"
                  />
                </div>
              </div>
              <div className="w-1/3">
                <label className="block text-gray-700 font-medium mb-2">
                  CVV
                </label>
                <input
                  type="text"
                  name="cvv"
                  value={paymentDetails.cvv}
                  onChange={handleChange}
                  placeholder="XXX"
                  className="w-full border rounded-lg px-4 py-3"
                />
              </div>
            </div>
          </div>

          {/* Total Cost Section */}
          <div className="w-full md:w-1/3 bg-gray-100 rounded-xl p-6 text-center shadow">
            <h3 className="text-lg font-bold mb-4">Total Cost</h3>
            <p className="text-4xl font-extrabold text-blue-700">
              ${bookingDetails?.TotalPrice || "0.00"}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              For {bookingDetails?.RoomType || "1 room"}
            </p>
            <p className="text-sm text-red-500 mt-4">
              Note: You must pay at least 30% of the total cost to reserve.
            </p>
            <button
              onClick={handlePayment}
              className="mt-6 w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
            >
              Proceed to Payment
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentPage;
