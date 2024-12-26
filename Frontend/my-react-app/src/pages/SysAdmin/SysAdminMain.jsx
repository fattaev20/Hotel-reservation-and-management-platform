import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function SysAdminMain() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchTableNames();
  }, []);

  const fetchTableNames = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const request = { action: "get_all_table_names" };
      const result = await window.electronAPI.sendToServer(request);
      const lines = result.response.split("\n");
      const jsonLine = lines
        .reverse()
        .find((line) => line.trim().startsWith("{"));
      if (!jsonLine) {
        throw new Error("No JSON object found in the server response.");
      }

      const parsed = JSON.parse(jsonLine.trim());
      if (parsed.status === "success" && Array.isArray(parsed.table_names)) {
        setTables(parsed.table_names);
      } else {
        setErrorMessage("Failed to fetch table names.");
      }
    } catch (error) {
      setErrorMessage(`Error: ${error.message || "Something went wrong."}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="max-w-full mx-auto mt-10 p-4">
        <motion.h2
          className="text-2xl font-bold mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Database Tables
        </motion.h2>

        {loading && (
          <motion.p
            className="text-gray-600 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            Loading table names...
          </motion.p>
        )}

        {errorMessage && (
          <motion.p
            className="text-red-500 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {errorMessage}
          </motion.p>
        )}

        <AnimatePresence>
          {!loading && tables.length > 0 && (
            <motion.div
              className="bg-white shadow rounded-md"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <ul className="divide-y divide-gray-200">
                {tables.map((table) => (
                  <Link
                    to={`/table/${table}`}
                    key={table} // Use table as the unique key
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <motion.li
                      className="p-4 hover:bg-gray-100 focus:bg-blue-50 
                 focus:outline-none focus:ring-2 focus:ring-blue-500 
                 cursor-pointer"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: 0.05, duration: 0.3 }}
                    >
                      {table}
                    </motion.li>
                  </Link>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        {!loading && tables.length === 0 && !errorMessage && (
          <motion.p
            className="text-gray-500 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            No tables available.
          </motion.p>
        )}
      </div>
    </div>
  );
}
