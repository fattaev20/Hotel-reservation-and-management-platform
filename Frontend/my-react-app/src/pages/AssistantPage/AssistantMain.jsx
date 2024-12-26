import React, { useEffect, useState } from "react";

const AssistantMain = () => {
  const [hotelInfo, setHotelInfo] = useState(null); // Hotel basic information
  const [roomTypes, setRoomTypes] = useState([]); // List of room types
  const [rooms, setRooms] = useState([]); // List of rooms
  const [errorMessage, setErrorMessage] = useState(""); // Error messages
  const [editHotelInfo, setEditHotelInfo] = useState(false); // Editing state
  const [editData, setEditData] = useState({}); // Form data for editing

  const staffID = JSON.parse(localStorage.getItem("userData"))?.id; // Get staff ID from localStorage

  const parseResponse = (response) => {
    if (!response || typeof response !== "string") {
      throw new Error("Invalid server response.");
    }
    const lines = response.split("\n");
    const jsonLine = lines.find(
      (line) => line.trim().startsWith("{") && line.trim().endsWith("}")
    );
    if (!jsonLine) {
      throw new Error("No valid JSON object found in response.");
    }
    return JSON.parse(jsonLine.trim());
  };

  const fetchHotelData = async () => {
    try {
      const basicInfoResponse = await window.electronAPI.sendToServer({
        action: "get_basic_information",
        StaffID: staffID,
      });
      const roomTypesResponse = await window.electronAPI.sendToServer({
        action: "get_room_types_info",
        StaffID: staffID,
      });
      const roomsResponse = await window.electronAPI.sendToServer({
        action: "get_rooms_list",
        StaffID: staffID,
      });

      const basicInfo = parseResponse(basicInfoResponse.response || "");
      const roomTypes = parseResponse(roomTypesResponse.response || "");
      const rooms = parseResponse(roomsResponse.response || "");

      if (basicInfo.status === "success") {
        setHotelInfo(basicInfo.hotel_info);
        setEditData(basicInfo.hotel_info);
      }

      if (
        roomTypes.status === "success" &&
        Array.isArray(roomTypes.room_types)
      ) {
        setRoomTypes(roomTypes.room_types);
      }

      if (rooms.status === "success" && Array.isArray(rooms.rooms)) {
        setRooms(rooms.rooms);
      }

      setErrorMessage("");
    } catch (error) {
      console.error("Error fetching hotel data:", error);
      setErrorMessage("Failed to fetch hotel data. Please try again later.");
    }
  };

  const updateBasicInformation = async () => {
    try {
      // Description must NOT exceed 100 characters
      if (editData.Description && editData.Description.length > 100) {
        setErrorMessage("Description cannot exceed 100 characters.");
        return;
      }

      // Facilities must NOT exceed 50 characters
      if (editData.Facilities && editData.Facilities.length > 50) {
        setErrorMessage("Facilities cannot exceed 50 characters.");
        return;
      }

      // Prepare the data to send
      const dataToSend = { ...editData };

      // If you truly do NOT want to send "Description" at all, uncomment below:
      // if (dataToSend.Description) {
      //   delete dataToSend.Description;
      // }

      // Make the server request
      const response = await window.electronAPI.sendToServer({
        action: "update_basic_info",
        ...dataToSend,
      });

      // Parse the server response
      const result = parseResponse(response.response || "");
      if (result.status === "success") {
        // Refresh data, close modal, clear errors
        await fetchHotelData();
        setEditHotelInfo(false);
        setErrorMessage("");
      } else {
        console.error("Update Failed:", result.message);
        setErrorMessage(result.message || "Failed to update information.");
      }
    } catch (error) {
      console.error("Error updating basic information:", error);
      setErrorMessage("Failed to update information. Please try again later.");
    }
  };

  useEffect(() => {
    if (staffID) fetchHotelData();
  }, [staffID]);

  return (
    <div className="min-h-screen p-2">
      <div className="max-w-6xl mx-auto  p-6 bg-white mt-2 rounded-lg">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-6 text-center">
          Intercontinental Hotel Information
        </h1>

        {errorMessage && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
            {errorMessage}
          </div>
        )}

        {/* Basic Information Section */}
        {hotelInfo && (
          <section className="mb-10 border border-blue-300 rounded-lg p-6 bg-white shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex justify-between">
              Basic Information
              <button
                className="bg-blue-500 text-white text-sm px-2 py-2 rounded-lg hover:bg-blue-600"
                onClick={() => setEditHotelInfo(true)}
              >
                Edit Information
              </button>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Hotel Description */}
              <div className="mb-4">
                <p className="text-sm font-bold text-gray-600 capitalize">
                  Hotel Description
                </p>
                <p className="text-gray-800">
                  {hotelInfo.Description || "N/A"}
                </p>
              </div>

              {/* Address */}
              <div className="mb-4">
                <p className="text-sm font-bold text-gray-600 capitalize">
                  Address
                </p>
                <p className="text-gray-800">{hotelInfo.Address || "N/A"}</p>
              </div>

              {/* Phone Number */}
              <div className="mb-4">
                <p className="text-sm font-bold text-gray-600 capitalize">
                  Phone Number
                </p>
                <p className="text-gray-800">{hotelInfo.Phone || "N/A"}</p>
              </div>

              {/* Star Rating */}
              <div className="mb-4">
                <p className="text-sm font-bold text-gray-600 capitalize">
                  Star Rating
                </p>
                <p className="text-gray-800">{hotelInfo.Stars || "N/A"}</p>
              </div>

              {/* Check-In Time */}
              <div className="mb-4">
                <p className="text-sm font-bold text-gray-600 capitalize">
                  Check-In Time
                </p>
                <p className="text-gray-800">
                  {hotelInfo.CheckInTime || "N/A"}
                </p>
              </div>

              {/* Check-Out Time */}
              <div className="mb-4">
                <p className="text-sm font-bold text-gray-600 capitalize">
                  Check-Out Time
                </p>
                <p className="text-gray-800">
                  {hotelInfo.CheckOutTime || "N/A"}
                </p>
              </div>

              {/* Facilities */}
              <div className="mb-4 md:col-span-2">
                <p className="text-sm font-bold text-gray-600 capitalize">
                  Facilities
                </p>
                <p className="text-gray-800">{hotelInfo.Facilities || "N/A"}</p>
              </div>
            </div>
          </section>
        )}

        {/* Edit Modal */}
        {editHotelInfo && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl w-full h-full max-w-screen-lg p-8 overflow-y-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                Edit Basic Information
              </h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  updateBasicInformation();
                }}
                className="space-y-6"
              >
                {Object.entries(editData)
                  .filter(([key]) => key !== "HotelID") // Exclude HotelID
                  .map(([key, value]) => (
                    <div key={key} className="flex flex-col">
                      <label className="text-gray-700 font-semibold mb-2">
                        {key.replace(/_/g, " ")}
                      </label>
                      <input
                        type="text"
                        value={value || ""} // Handle null values
                        onChange={(e) =>
                          setEditData({ ...editData, [key]: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring focus:ring-blue-300"
                      />
                    </div>
                  ))}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
                    onClick={() => setEditHotelInfo(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Room Types Section */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Room Types</h2>
          <div className="space-y-6">
            {roomTypes.map((type) => (
              <div
                key={type.TypeID}
                className="border border-gray-300 rounded-lg p-6 shadow-sm bg-white"
              >
                <h3 className="text-lg font-semibold text-gray-800">
                  {type.Name}
                </h3>
                <p className="text-gray-600 mt-2">{type.Description}</p>
                <p className="text-gray-600 mt-2 font-medium">
                  Facilities: {type.Facility}
                </p>
                <div className="mt-2">
                  <p className="text-sm text-gray-700">
                    Price (Adults): ${type.PriceAdults || "N/A"}, Price
                    (Children): ${type.PriceChildren || "N/A"}, Price (Babies):
                    ${type.PriceBabies || "N/A"}
                  </p>
                  <p className="text-sm text-gray-700">
                    Capacity: {type.Capacity || "N/A"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Rooms Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Rooms</h2>
          {rooms && rooms.length > 0 ? (
            <table className="w-full border-collapse bg-white rounded-md shadow-md">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border px-4 py-2 text-left">Room Number</th>
                  <th className="border px-4 py-2 text-left">Room Type</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr
                    key={room.RoomNumber}
                    className="border-b hover:bg-gray-100"
                  >
                    <td className="border px-4 py-2">{room.RoomNumber}</td>
                    <td className="border px-4 py-2">{room.Name || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500">No rooms available.</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default AssistantMain;
