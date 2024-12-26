import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const PasswordGuest = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showVerifyPassword, setShowVerifyPassword] = useState(false);

  const validateForm = () => {
    setErrorMessage("");
    const trimmedUsername = username.replace("@", "").trim();

    if (!trimmedUsername) {
      setErrorMessage("Username cannot be empty.");
      return false;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return false;
    }

    if (password !== verifyPassword) {
      setErrorMessage("Passwords do not match!");
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    const request = {
      action: "register_guest_2",
      ClientID: parseInt(id, 10),
      Username: username.replace("@", ""),
      Password: password,
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

      if (parsedResult.status === "success") {
        alert("Password set successfully! You can now log in.");
        navigate("/loginguest"); // Navigate to the login page
      } else {
        setErrorMessage(
          parsedResult.message ||
            "An error occurred while setting the password."
        );
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("An error occurred during password setup.");
    }
  };

  return (
    <div className="min-h-screen">
      <main className="max-w-md mx-auto bg-white p-8 mt-8 rounded shadow">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Account Information
        </h2>

        <label className="block font-medium mb-2">Username</label>
        <input
          type="text"
          className="w-full p-2 mb-4 border border-gray-300 rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <label className="block font-medium mb-2">Password</label>
        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            className={`w-full p-2 border rounded ${
              errorMessage.toLowerCase().includes("password")
                ? "border-red-500"
                : "border-gray-300"
            }`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter a strong password"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-2 flex items-center text-sm text-blue-600 hover:text-blue-800"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <label className="block font-medium mb-2">Verify Password</label>
        <div className="relative mb-4">
          <input
            type={showVerifyPassword ? "text" : "password"}
            className={`w-full p-2 border rounded ${
              errorMessage.toLowerCase().includes("match")
                ? "border-red-500"
                : "border-gray-300"
            }`}
            value={verifyPassword}
            onChange={(e) => setVerifyPassword(e.target.value)}
            placeholder="Retype your password"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-2 flex items-center text-sm text-blue-600 hover:text-blue-800"
            onClick={() => setShowVerifyPassword(!showVerifyPassword)}
          >
            {showVerifyPassword ? "Hide" : "Show"}
          </button>
        </div>

        {errorMessage && (
          <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
        )}

        <button
          className="w-full py-2 text-white font-semibold rounded bg-blue-600 hover:bg-blue-700"
          onClick={handleLogin}
        >
          Save Password
        </button>
      </main>
    </div>
  );
};

export default PasswordGuest;
