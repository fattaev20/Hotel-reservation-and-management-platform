// CityHotels.js
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { MdArrowBack, MdSearch, MdStar } from "react-icons/md";

// ------------------------------
// Hotel Image Imports
// ------------------------------
import image_1 from "../../assets/images/1.webp";
import image_2 from "../../assets/images/2.webp";
import image_3 from "../../assets/images/3.webp";
import image_4 from "../../assets/images/4.webp";
import image_5 from "../../assets/images/5.webp";
import image_6 from "../../assets/images/6.webp";
import image_7 from "../../assets/images/7.webp";
import image_8 from "../../assets/images/8.webp";
import image_9 from "../../assets/images/9.webp";
import image_10 from "../../assets/images/10.webp";
import image_11 from "../../assets/images/11.webp";
import image_12 from "../../assets/images/12.webp";
import image_13 from "../../assets/images/13.webp";
import image_14 from "../../assets/images/14.webp";
import image_15 from "../../assets/images/15.webp";
import image_16 from "../../assets/images/16.webp";
import image_17 from "../../assets/images/17.webp";
import image_18 from "../../assets/images/18.webp";
import image_19 from "../../assets/images/19.webp";
import image_20 from "../../assets/images/20.webp";
import image_21 from "../../assets/images/21.webp";
import image_22 from "../../assets/images/22.webp";
import image_23 from "../../assets/images/23.webp";
import image_24 from "../../assets/images/24.webp";
import image_25 from "../../assets/images/25.webp";
import image_26 from "../../assets/images/26.webp";
import image_27 from "../../assets/images/27.webp";
import image_28 from "../../assets/images/28.webp";
import image_29 from "../../assets/images/29.webp";
import image_30 from "../../assets/images/30.webp";
import image_31 from "../../assets/images/31.webp";
import image_32 from "../../assets/images/32.webp";
import image_33 from "../../assets/images/33.webp";
import image_34 from "../../assets/images/34.webp";
import image_35 from "../../assets/images/35.webp";
import image_36 from "../../assets/images/36.webp";
import image_37 from "../../assets/images/37.webp";
import image_38 from "../../assets/images/38.webp";
import image_39 from "../../assets/images/39.webp";
import image_40 from "../../assets/images/40.webp";
import image_41 from "../../assets/images/41.webp";
import image_42 from "../../assets/images/42.webp";
import image_43 from "../../assets/images/43.webp";
import image_44 from "../../assets/images/44.webp";
import image_45 from "../../assets/images/45.webp";
import image_46 from "../../assets/images/46.webp";
import image_47 from "../../assets/images/47.webp";
import image_48 from "../../assets/images/48.webp";
import image_49 from "../../assets/images/49.webp";
import image_50 from "../../assets/images/50.webp";
import image_51 from "../../assets/images/51.webp";
import image_52 from "../../assets/images/52.webp";
import image_53 from "../../assets/images/53.webp";
import image_54 from "../../assets/images/54.webp";
import image_55 from "../../assets/images/55.webp";
import image_56 from "../../assets/images/56.webp";
import image_57 from "../../assets/images/57.webp";
import image_58 from "../../assets/images/58.webp";
import image_59 from "../../assets/images/59.webp";
import image_60 from "../../assets/images/60.webp";
import image_61 from "../../assets/images/61.webp";
import image_62 from "../../assets/images/62.webp";
import image_63 from "../../assets/images/63.webp";
import image_64 from "../../assets/images/64.webp";
import image_65 from "../../assets/images/65.webp";
import image_66 from "../../assets/images/66.webp";
import image_67 from "../../assets/images/67.webp";
// import image_68 from "../../assets/images/68.webp";
import image_69 from "../../assets/images/69.webp";
import image_70 from "../../assets/images/70.webp";
import image_71 from "../../assets/images/71.webp";
import image_72 from "../../assets/images/72.webp";
import image_73 from "../../assets/images/73.webp";
import image_74 from "../../assets/images/74.webp";
import image_75 from "../../assets/images/75.webp";
import image_76 from "../../assets/images/76.webp";
import image_77 from "../../assets/images/77.webp";
import image_78 from "../../assets/images/78.webp";
// import image_79 from "../../assets/images/79.webp";
import image_80 from "../../assets/images/80.webp";
import image_81 from "../../assets/images/81.webp";
import image_82 from "../../assets/images/82.webp";
import image_83 from "../../assets/images/83.webp";
import image_84 from "../../assets/images/84.webp";
import image_85 from "../../assets/images/85.webp";
import image_86 from "../../assets/images/86.webp";
import image_87 from "../../assets/images/87.webp";
import image_88 from "../../assets/images/88.webp";
import image_89 from "../../assets/images/89.webp";
import image_90 from "../../assets/images/90.webp";
import image_91 from "../../assets/images/91.webp";
import image_92 from "../../assets/images/92.webp";
import image_93 from "../../assets/images/93.webp";
import image_94 from "../../assets/images/94.webp";
import image_95 from "../../assets/images/95.webp";
import image_96 from "../../assets/images/96.webp";
import image_97 from "../../assets/images/97.webp";
// import image_98 from "../../assets/images/98.webp";
import image_99 from "../../assets/images/99.webp";
import image_100 from "../../assets/images/100.webp";

// ---------------------------------------------------------------------
// Map of hotel IDs to images. Adjust or add IDs as needed.
// ---------------------------------------------------------------------
const hotelImageMap = {
  1: image_1,
  2: image_2,
  3: image_3,
  4: image_4,
  5: image_5,
  6: image_6,
  7: image_7,
  8: image_8,
  9: image_9,
  10: image_10,
  11: image_11,
  12: image_12,
  13: image_13,
  14: image_14,
  15: image_15,
  16: image_16,
  17: image_17,
  18: image_18,
  19: image_19,
  20: image_20,
  21: image_21,
  22: image_22,
  23: image_23,
  24: image_24,
  25: image_25,
  26: image_26,
  27: image_27,
  28: image_28,
  29: image_29,
  30: image_30,
  31: image_31,
  32: image_32,
  33: image_33,
  34: image_34,
  35: image_35,
  36: image_36,
  37: image_37,
  38: image_38,
  39: image_39,
  40: image_40,
  41: image_41,
  42: image_42,
  43: image_43,
  44: image_44,
  45: image_45,
  46: image_46,
  47: image_47,
  48: image_48,
  49: image_49,
  50: image_50,
  51: image_51,
  52: image_52,
  53: image_53,
  54: image_54,
  55: image_55,
  56: image_56,
  57: image_57,
  58: image_58,
  59: image_59,
  60: image_60,
  61: image_61,
  62: image_62,
  63: image_63,
  64: image_64,
  65: image_65,
  66: image_66,
  67: image_67,
  // 68: image_68,  // if needed
  69: image_69,
  70: image_70,
  71: image_71,
  72: image_72,
  73: image_73,
  74: image_74,
  75: image_75,
  76: image_76,
  77: image_77,
  78: image_78,
  // 79: image_79,  // if needed
  80: image_80,
  81: image_81,
  82: image_82,
  83: image_83,
  84: image_84,
  85: image_85,
  86: image_86,
  87: image_87,
  88: image_88,
  89: image_89,
  90: image_90,
  91: image_91,
  92: image_92,
  93: image_93,
  94: image_94,
  95: image_95,
  96: image_96,
  97: image_97,
  // 98: image_98,  // if needed
  99: image_99,
  100: image_100,
};

// Return the image URL or null if not found
function getHotelImage(hotelID) {
  return hotelImageMap[hotelID] || null;
}

export default function CityHotels() {
  const { cityName } = useParams();
  const navigate = useNavigate();

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Search/filter states
  const [keyword, setKeyword] = useState("");
  const [filterStars, setFilterStars] = useState(0); // 0 => show all

  // Fetch hotels on mount or when cityName changes
  useEffect(() => {
    if (cityName) {
      fetchHotels(cityName);
    }
  }, [cityName]);

  // -------------------------------------
  // Fetch hotels by city
  // -------------------------------------
  const fetchHotels = async (city) => {
    setLoading(true);
    setErrorMessage("");
    setHotels([]);

    const request = {
      action: "get_hotel_by_city",
      city: city,
    };

    try {
      const result = await window.electronAPI.sendToServer(request);
      // Parse the server response
      const lines = result.response.split("\n");
      const jsonLine = lines.find((line) => line.trim().startsWith("{"));

      if (!jsonLine) {
        throw new Error("No JSON object found in the server response.");
      }

      const parsed = JSON.parse(jsonLine.trim());
      if (parsed.status === "success" && Array.isArray(parsed.hotels)) {
        setHotels(parsed.hotels);
      } else {
        setErrorMessage("No hotels found for this city.");
      }
    } catch (error) {
      setErrorMessage(error.message || "Something went wrong fetching hotels.");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------
  // Search for hotels by keyword
  // -------------------------------------
  const handleSearch = async () => {
    setLoading(true);
    setErrorMessage("");
    setHotels([]);

    const request = {
      action: "find_hotel",
      keyword: keyword,
    };

    try {
      const result = await window.electronAPI.sendToServer(request);
      // Parse the server response
      const lines = result.response.split("\n");
      const jsonLine = lines.find((line) => line.trim().startsWith("{"));

      if (!jsonLine) {
        throw new Error("No JSON object found in the server response.");
      }

      const parsed = JSON.parse(jsonLine.trim());
      if (parsed.status === "success" && Array.isArray(parsed.hotels)) {
        setHotels(parsed.hotels);
      } else {
        setErrorMessage("No hotels found for this search.");
      }
    } catch (error) {
      setErrorMessage(
        error.message || "Something went wrong searching hotels."
      );
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------
  // Filter hotels by star rating
  // -------------------------------------
  const filteredHotels = filterStars
    ? hotels.filter((hotel) => Number(hotel.Stars) === filterStars)
    : hotels;

  // -------------------------------------
  // When a user clicks on a hotel card
  // -------------------------------------
  const handleHotelClick = (hotelID) => {
    const hotelImgUrl = getHotelImage(hotelID);
    // Pass the image as location.state if needed in HotelInfo
    navigate(`/hotel/${hotelID}`, { state: { hotelImage: hotelImgUrl } });
  };

  // -------------------------------------
  // Go back to the previous page
  // -------------------------------------
  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto mt-10 p-6">
        {/* Top Controls: Back Button, Search, Star Filter */}
        <div className="flex flex-col-reverse lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          {/* BACK BUTTON */}
          <motion.div
            className="flex items-center gap-2 cursor-pointer"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            onClick={handleBack}
          >
            <MdArrowBack size={28} className="text-gray-700" />
            <span className="text-gray-700 text-lg font-medium">Back</span>
          </motion.div>

          {/* SEARCH + STAR FILTER */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {/* SEARCH BAR */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search hotels..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
              >
                <MdSearch size={20} />
              </button>
            </div>

            {/* STAR FILTER */}
            <div className="flex items-center gap-2">
              <label htmlFor="starFilter" className="text-gray-700 font-medium">
                Filter by Stars:
              </label>
              <select
                id="starFilter"
                className="px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterStars}
                onChange={(e) => setFilterStars(Number(e.target.value))}
              >
                <option value={0}>All Stars</option>
                <option value={1}>1 Star</option>
                <option value={2}>2 Stars</option>
                <option value={3}>3 Stars</option>
                <option value={4}>4 Stars</option>
                <option value={5}>5 Stars</option>
              </select>
            </div>
          </div>
        </div>

        {/* PAGE TITLE */}
        <motion.h2
          className="text-3xl font-bold text-center text-gray-800 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Hotels in {cityName || "Unknown City"}
        </motion.h2>

        {/* LOADING */}
        {loading && (
          <motion.p
            className="text-center text-gray-600 animate-pulse"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            Loading hotels...
          </motion.p>
        )}

        {/* ERROR MESSAGE */}
        {errorMessage && !loading && (
          <motion.p
            className="text-center text-red-500 font-semibold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {errorMessage}
          </motion.p>
        )}

        {/* HOTEL GRID */}
        {!loading && !errorMessage && filteredHotels.length > 0 && (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {filteredHotels.map((hotel) => (
              <motion.div
                key={hotel.HotelID}
                onClick={() => handleHotelClick(hotel.HotelID)}
                className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition cursor-pointer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-full h-40 bg-gray-200 rounded-lg mb-4 overflow-hidden">
                  <img
                    src={getHotelImage(hotel.HotelID)}
                    alt={`Hotel ${hotel.Name}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {hotel.Name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {hotel.Address || "No address provided"}
                </p>
                <div className="flex items-center">
                  {Array.from({ length: 5 }, (_, i) => i + 1).map((star) => (
                    <MdStar
                      key={star}
                      size={20}
                      className={
                        star <= hotel.Stars
                          ? "text-yellow-500"
                          : "text-gray-300"
                      }
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* NO HOTELS FOUND */}
        {!loading && !errorMessage && filteredHotels.length === 0 && (
          <motion.p
            className="text-center text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            No hotels to display.
          </motion.p>
        )}
      </div>
    </div>
  );
}
