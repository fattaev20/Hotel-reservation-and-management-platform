import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";

const LoginGuest = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async () => {
    setErrorMessage(""); // Clear any previous error messages

    // Validate input fields
    if (!username.trim() || !password.trim()) {
      setErrorMessage("Username and password are required.");
      return;
    }

    // Prepare the request payload
    const request = {
      action: "login_guest",
      Username: username.replace("@", "").trim(),
      Password: password.trim(),
    };

    try {
      // Send the login request
      const result = await window.electronAPI.sendToServer(request);

      // Parse the response
      const lines = result.response.split("\n");
      const jsonLine = lines
        .reverse()
        .find((line) => line.trim().startsWith("{"));

      if (!jsonLine) {
        throw new Error("No JSON object found in the server response.");
      }

      const parsedResult = JSON.parse(jsonLine.trim());

      // Handle success
      if (parsedResult.status === "success") {
        // Save only guest-specific data (no userRole added to localStorage)
        localStorage.setItem(
          "userData",
          JSON.stringify({
            id: parsedResult.guest.ClientID,
            name: parsedResult.guest.Username,
          })
        );

        // Navigate to clientmain
        navigate("/clientmain");
      } else {
        // Show error message from server response
        setErrorMessage(parsedResult.message || "Wrong Password or Username!");
      }
    } catch (err) {
      // Handle unexpected errors
      console.error(err);
      setErrorMessage("An error occurred during login. Please try again.");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="bg-[#F3F4F6] min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="bg-white p-8 rounded shadow max-w-sm w-full">
          <h2 className="text-xl font-semibold text-center mb-6">
            Welcome to Booking Portal!
          </h2>

          {/* Username Field */}
          <label className="block font-medium mb-2">Username</label>
          <input
            type="text"
            className="w-full p-2 mb-4 border border-gray-300 rounded"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          {/* Password Field */}
          <label className="block font-medium mb-2">Password</label>
          <div className="relative w-full mb-4">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-2 flex items-center"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? (
                <MdVisibilityOff size={20} className="text-gray-500" />
              ) : (
                <MdVisibility size={20} className="text-gray-500" />
              )}
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
            className="w-full py-2 text-white font-semibold bg-blue-600 hover:bg-blue-700 rounded"
            onClick={handleLogin}
          >
            Log In
          </button>
        </div>
      </main>
    </div>
  );
};

export default LoginGuest;
