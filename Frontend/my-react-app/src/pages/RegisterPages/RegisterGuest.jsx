import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const RegisterGuest = () => {
  const navigate = useNavigate();

  // Fields required for guest registration
  const [fullName, setFullName] = useState("");
  const [birthDay, setBirthDay] = useState("1");
  const [birthMonth, setBirthMonth] = useState("Jan");
  const [birthYear, setBirthYear] = useState("2000");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [passportSeries, setPassportSeries] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState({}); // Track field-specific errors

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

  // Real-time validation for inputs
  const validateForm = () => {
    const newErrors = {};
    if (!fullName.trim()) newErrors.fullName = "Full Name is required.";
    if (!address.trim()) newErrors.address = "Address is required.";
    if (!phone.trim() || phone.length < 7)
      newErrors.phone = "Phone number is invalid.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email))
      newErrors.email = "Invalid email address.";
    if (!passportSeries.trim())
      newErrors.passportSeries = "Passport series is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const monthToNumber = (monthName) => {
    const index = months.indexOf(monthName);
    return index >= 0 ? String(index + 1).padStart(2, "0") : "01";
  };

  const handleNext = async () => {
    if (!validateForm()) return;

    const monthNum = monthToNumber(birthMonth);
    const dateOfBirth = `${birthYear}-${monthNum}-${birthDay.padStart(2, "0")}`;

    const request = {
      action: "register_guest",
      FullName: fullName.trim(),
      DateOfBirth: dateOfBirth,
      Address: address.trim(),
      Phone: phone.trim(),
      PassportSeries: passportSeries.trim(),
      Email: email.trim(),
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
        // Save user data to localStorage
        localStorage.setItem(
          "userData",
          JSON.stringify({ id: parsedResult.id, name: fullName.trim() })
        );

        navigate(`/password-guest/${parsedResult.id}`);
      } else {
        setErrors({ general: parsedResult.message || "Registration failed." });
      }
    } catch (err) {
      setErrors({ general: "An error occurred during registration." });
    }
  };

  const inputClass = (field) =>
    `w-full p-2 border rounded-lg focus:outline-none focus:ring-2 ${
      errors[field]
        ? "border-red-500 focus:ring-red-400"
        : "border-gray-300 focus:ring-blue-200"
    }`;

  return (
    <div className="bg-[#F3F4F6] h-[89vh] flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
            Register as a Guest
          </h2>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="col-span-2">
              <label className="block font-medium text-gray-700 mb-2">
                Full Name
              </label>
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
              <label className="block font-medium text-gray-700 mb-2">
                Birth Date
              </label>
              <div className="flex gap-2">
                <select
                  value={birthDay}
                  onChange={(e) => setBirthDay(e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
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
                  className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
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
                  className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
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
              <label className="block font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="text"
                className={inputClass("phone")}
                placeholder="+998 99 999 99 99"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-2">
                Email
              </label>
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
              <label className="block font-medium text-gray-700 mb-2">
                Passport Series
              </label>
              <input
                type="text"
                className={inputClass("passportSeries")}
                placeholder="AB1234567"
                value={passportSeries}
                onChange={(e) => setPassportSeries(e.target.value)}
              />
              {errors.passportSeries && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.passportSeries}
                </p>
              )}
            </div>

            <div className="col-span-2">
              <label className="block font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                className={inputClass("address")}
                placeholder="123 Main Street"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              {errors.address && (
                <p className="text-red-500 text-sm mt-1">{errors.address}</p>
              )}
            </div>
          </div>

          {errors.general && (
            <p className="text-red-500 text-center text-sm mb-4">
              {errors.general}
            </p>
          )}

          <button
            className="w-full py-3 text-white font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 transition-all"
            onClick={handleNext}
          >
            Next
          </button>
        </div>
      </main>
    </div>
  );
};

export default RegisterGuest;
