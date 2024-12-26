import React, { useState } from "react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";

const RegisterStaff = () => {
  const navigate = useNavigate();

  const [options, setOptions] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [position, setPosition] = useState(null);
  const [fullName, setFullName] = useState("");
  const [birthDay, setBirthDay] = useState("1");
  const [birthMonth, setBirthMonth] = useState("Jan");
  const [birthYear, setBirthYear] = useState("2000");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [passportSeries, setPassportSeries] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState({});

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const monthToNumber = (monthName) => {
    const index = months.indexOf(monthName);
    return index >= 0 ? String(index + 1).padStart(2, "0") : "01";
  };

  const fetchHotels = async () => {
    if (!keyword.trim()) {
      setResponseMessage("Please enter a search term.");
      setOptions([]);
      return;
    }

    setLoading(true);
    setResponseMessage("");

    const request = { action: "find_hotel", keyword: keyword.trim() };

    try {
      const result = await window.electronAPI.sendToServer(request);
      const lines = result.response.split("\n");
      const jsonLine = lines
        .reverse()
        .find((line) => line.trim().startsWith("{"));
      if (!jsonLine)
        throw new Error("No JSON object found in the server response.");

      const parsedResult = JSON.parse(jsonLine.trim());
      if (
        parsedResult.status === "success" &&
        parsedResult.hotels?.length > 0
      ) {
        const hotelOptions = parsedResult.hotels.map((hotel) => ({
          value: hotel.HotelID,
          label: hotel.Name,
        }));
        setOptions(hotelOptions);
        setResponseMessage("");
      } else {
        setOptions([]);
        setResponseMessage("No hotels found.");
      }
    } catch (err) {
      setResponseMessage(`Error: ${err.message || "Something went wrong."}`);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!selectedHotel) newErrors.selectedHotel = "Please select a hotel.";
    if (!position) newErrors.position = "Please select your position.";
    if (!fullName.trim()) newErrors.fullName = "Full Name is required.";
    if (!phoneNumber.trim() || phoneNumber.length < 10)
      newErrors.phoneNumber = "A valid phone number is required.";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "A valid email is required.";
    }
    if (!passportSeries.trim())
      newErrors.passportSeries = "Passport series is required.";
    if (!address.trim()) newErrors.address = "Address is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateForm()) return;

    const monthNum = monthToNumber(birthMonth);
    const dateOfBirth = `${birthYear}-${monthNum}-${birthDay.padStart(2, "0")}`;

    const request = {
      action: "register_staff",
      FullName: fullName.trim(),
      DateOfBirth: dateOfBirth,
      Address: address.trim(),
      Phone: phoneNumber.trim(),
      PassportSeries: passportSeries.trim(),
      Email: email.trim(),
      HotelID: selectedHotel.value,
      Position: position,
    };

    try {
      const result = await window.electronAPI.sendToServer(request);
      const lines = result.response.split("\n");
      const jsonLine = lines
        .reverse()
        .find((line) => line.trim().startsWith("{"));
      if (!jsonLine)
        throw new Error("No JSON object found in the server response.");

      const parsedResult = JSON.parse(jsonLine.trim());
      if (parsedResult.status === "success" && parsedResult.id) {
        navigate(`/password-creation/${parsedResult.id}`);
      } else {
        alert(parsedResult.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      alert("An error occurred during registration.");
    }
  };

  const inputClass = (field) =>
    `w-full p-2 border rounded ${
      errors[field] ? "border-red-500" : "border-gray-300"
    } focus:outline-none focus:ring focus:ring-blue-200`;

  return (
    <div className="bg-[#F3F4F6] h-[89vh] flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl overflow-auto">
          <h2 className="text-2xl font-semibold text-center mb-6">
            Staff Registration
          </h2>

          {/* Hotel Search */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Choose your hotel</h3>
            <p className="text-sm mb-4 text-gray-500">
              Search for the hotel by name.
            </p>
            <div className="flex gap-4 items-center">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Enter hotel name"
                className="w-full p-2 border rounded focus:outline-none focus:ring focus:ring-blue-200"
              />
              <button
                onClick={fetchHotels}
                disabled={loading}
                className={`px-4 py-2 rounded font-semibold text-white ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </div>
          </div>

          {/* Hotel Selection */}
          {options.length > 0 && (
            <div className="mb-6">
              <label className="block font-medium mb-2">Select a Hotel</label>
              <Select
                options={options}
                placeholder="Choose a hotel..."
                isLoading={loading}
                isClearable
                isSearchable
                onChange={(selected) => setSelectedHotel(selected)}
                value={selectedHotel}
                className={`${errors.selectedHotel ? "border-red-500" : ""}`}
              />
              {errors.selectedHotel && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.selectedHotel}
                </p>
              )}
            </div>
          )}

          {/* Position */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Select your position</h3>
            <div className="flex gap-4 justify-center">
              {["Hotel Manager", "Manager Assistant", "Roomboy"].map((pos) => (
                <div
                  key={pos}
                  onClick={() => setPosition(pos)}
                  className={`px-6 py-2 rounded-lg cursor-pointer text-center ${
                    position === pos
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {pos}
                </div>
              ))}
            </div>
            {errors.position && (
              <p className="text-red-500 text-sm mt-2 text-center">
                {errors.position}
              </p>
            )}
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block font-medium mb-2">Full Name</label>
              <input
                type="text"
                className={inputClass("fullName")}
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              {errors.fullName && (
                <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
              )}
            </div>
            <div>
              <label className="block font-medium mb-2">Birth Date</label>
              <div className="flex gap-2">
                <select
                  value={birthDay}
                  onChange={(e) => setBirthDay(e.target.value)}
                  className="p-2 border rounded focus:outline-none focus:ring focus:ring-blue-200"
                >
                  {Array.from({ length: 31 }, (_, i) => (i + 1).toString()).map(
                    (day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    )
                  )}
                </select>
                <select
                  value={birthMonth}
                  onChange={(e) => setBirthMonth(e.target.value)}
                  className="p-2 border rounded focus:outline-none focus:ring focus:ring-blue-200"
                >
                  {months.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <select
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  className="p-2 border rounded focus:outline-none focus:ring focus:ring-blue-200"
                >
                  {Array.from({ length: 50 }, (_, i) =>
                    (1970 + i).toString()
                  ).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block font-medium mb-2">Phone Number</label>
              <input
                type="text"
                className={inputClass("phoneNumber")}
                placeholder="+998 99 999 99 99"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              {errors.phoneNumber && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.phoneNumber}
                </p>
              )}
            </div>
            <div>
              <label className="block font-medium mb-2">Email</label>
              <input
                type="email"
                className={inputClass("email")}
                placeholder="example@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
            <div>
              <label className="block font-medium mb-2">Passport Series</label>
              <input
                type="text"
                className={inputClass("passportSeries")}
                placeholder="AC1001010"
                value={passportSeries}
                onChange={(e) => setPassportSeries(e.target.value)}
              />
              {errors.passportSeries && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.passportSeries}
                </p>
              )}
            </div>
            <div>
              <label className="block font-medium mb-2">Address</label>
              <input
                type="text"
                className={inputClass("address")}
                placeholder="123 Main St"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              {errors.address && (
                <p className="text-red-500 text-sm mt-1">{errors.address}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            className="w-full py-3 mt-6 text-white font-semibold bg-blue-600 hover:bg-blue-700 rounded transition-all"
            onClick={handleNext}
          >
            Next
          </button>
        </div>
      </main>
    </div>
  );
};

export default RegisterStaff;
