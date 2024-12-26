// src/pages/RegisterPages/LoginStaff.js
import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const LoginStaff = ({ setUserRole }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Toggle password visibility
  const [errorMessage, setErrorMessage] = useState("");
  const [errors, setErrors] = useState({ username: false, password: false }); // Input errors

  const handleLogin = async () => {
    setErrorMessage("");
    setErrors({ username: false, password: false });

    const newErrors = {
      username: !username.trim(),
      password: !password.trim(),
    };

    if (newErrors.username || newErrors.password) {
      setErrors(newErrors);
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    const request = {
      action: "login_staff",
      Username: username.replace("@", "").trim(),
      Password: password.trim(),
    };

    try {
      const result = await window.electronAPI.sendToServer(request);
      const lines = result.response.split("\n");
      const jsonLine = lines
        .reverse()
        .find((line) => line.trim().startsWith("{"));

      if (!jsonLine) {
        throw new Error("No JSON object found in the server response.");
      }

      const parsedResult = JSON.parse(jsonLine.trim());

      if (parsedResult.status === "success") {
        // Save user data to localStorage
        localStorage.setItem(
          "userData",
          JSON.stringify({
            id: parsedResult.staff.StaffID,
            name: parsedResult.staff.Username,
          })
        );
        // Store userRole as a simple string
        localStorage.setItem("userRole", parsedResult.staff.Position);

        setUserRole(parsedResult.staff.Position); // Update state

        alert("Login successful!");
        // Navigate based on role
        navigate("/"); // Assuming "Hotel Manager" goes to "/dashboard"
      } else {
        setErrorMessage(parsedResult.message || "Wrong Password or Username!");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("An error occurred during login.");
    }
  };

  return (
    <div className="bg-[#F3F4F6] h-[89vh] flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="bg-white p-8 rounded shadow max-w-sm w-full">
          <h2 className="text-xl font-semibold text-center mb-6">
            Welcome to Booking Portal!
          </h2>

          {/* Username Field */}
          <label className="block font-medium mb-2">Username</label>
          <input
            type="text"
            className={`w-full p-2 mb-4 border rounded ${
              errors.username ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          {/* Password Field */}
          <label className="block font-medium mb-2">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className={`w-full p-2 mb-4 border rounded ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute top-[14px] right-3 flex items-center text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <p className="text-red-500 text-sm mb-4 text-center">
              {errorMessage}
            </p>
          )}

          {/* Login Button */}
          <button
            className="w-full py-2 text-white font-semibold bg-blue-600 hover:bg-blue-700 rounded transition-all"
            onClick={handleLogin}
          >
            Log In
          </button>
        </div>
      </main>
    </div>
  );
};

export default LoginStaff;
