import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { IoArrowBackSharp } from "react-icons/io5";

export default function TableDetails() {
  const { tableName } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [primaryKey, setPrimaryKey] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({});
  const [editData, setEditData] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchTableDetails(tableName);
  }, [tableName]);

  const parseResponse = (response) => {
    try {
      const lines = response.split("\n");
      const jsonLine = lines
        .reverse()
        .find(
          (line) => line.trim().startsWith("{") && line.trim().endsWith("}")
        );
      if (!jsonLine) {
        throw new Error("No valid JSON object found in response.");
      }
      return JSON.parse(jsonLine.trim());
    } catch (error) {
      throw new Error("Invalid JSON format in server response.");
    }
  };

  const fetchTableDetails = async (tblName) => {
    setLoading(true);
    setErrorMessage("");

    try {
      const request = { action: "get_table_details", table_name: tblName };
      const result = await window.electronAPI.sendToServer(request);

      const parsed = parseResponse(result.response);
      if (parsed.status === "success" && Array.isArray(parsed.data)) {
        setData(parsed.data);
        setColumns(Object.keys(parsed.data[0] || {}));
        const pk = Object.keys(parsed.data[0] || {}).find((key) =>
          key.toLowerCase().endsWith("id")
        );
        setPrimaryKey(pk);
      } else {
        throw new Error("Failed to fetch details.");
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    // Logic for creating a row
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    // Logic for deleting a row
  };

  const handleUpdate = async () => {
    // Logic for updating a row
    setEditData(null);
    setShowModal(false);
  };

  const BackButton = () => (
    <button
      onClick={() => navigate(-1)}
      className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded shadow hover:bg-gray-300 transition-transform duration-200 transform hover:scale-105"
    >
      <IoArrowBackSharp className="mr-2" />
      Back
    </button>
  );

  const Modal = ({ title, children, onClose }) => (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-3xl w-full">
        <h2 className="text-lg font-bold mb-4">{title}</h2>
        {children}
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded shadow hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div>
      <div className="max-w-6xl mx-auto mt-8 px-6">
        <div className="flex justify-between items-center mb-6">
          <BackButton />
          <motion.h1
            className="text-2xl font-bold"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Table: {tableName}
          </motion.h1>
          <motion.button
            onClick={() => {
              setFormData({});
              setShowModal(true);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition-transform duration-200 transform hover:scale-105"
          >
            Add Row
          </motion.button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-6">
            <motion.div
              className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          </div>
        ) : errorMessage ? (
          <motion.div
            className="text-center py-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-lg text-red-500">{errorMessage}</p>
          </motion.div>
        ) : (
          <motion.div
            className="overflow-auto bg-white shadow-md rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  {columns.slice(0, 3).map((col) => (
                    <th
                      key={col}
                      className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {col}
                    </th>
                  ))}
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((row, idx) => (
                  <motion.tr
                    key={idx}
                    className="hover:bg-gray-50 cursor-pointer"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setSelectedRow(row)}
                  >
                    {columns.slice(0, 3).map((col) => (
                      <td key={col} className="px-4 py-2 text-sm text-gray-700">
                        {row[col]}
                      </td>
                    ))}
                    <td className="px-4 py-2 flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditData({
                            id: row[primaryKey],
                            data: { ...row },
                          });
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(row[primaryKey]);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

        <AnimatePresence>
          {selectedRow && (
            <Modal title="Row Details" onClose={() => setSelectedRow(null)}>
              <div className="grid grid-cols-2 gap-4">
                {columns.map((col) => (
                  <div key={col}>
                    <p className="text-gray-600 text-sm font-medium">{col}</p>
                    <p className="text-gray-800 text-sm">{selectedRow[col]}</p>
                  </div>
                ))}
              </div>
            </Modal>
          )}

          {showModal && (
            <Modal
              title={editData ? "Edit Row" : "Add Row"}
              onClose={() => {
                setEditData(null);
                setFormData(null);
                setShowModal(false);
              }}
            >
              <div className="grid grid-cols-2 gap-4">
                {columns.map((col) => (
                  <div key={col}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {col}
                    </label>
                    <input
                      type="text"
                      value={
                        editData
                          ? editData.data[col] || ""
                          : formData[col] || ""
                      }
                      onChange={(e) =>
                        editData
                          ? setEditData({
                              ...editData,
                              data: {
                                ...editData.data,
                                [col]: e.target.value,
                              },
                            })
                          : setFormData({ ...formData, [col]: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={editData ? handleUpdate : handleCreate}
                  className="px-4 py-2 bg-green-500 text-white rounded shadow hover:bg-green-600"
                >
                  {editData ? "Update" : "Add"}
                </button>
              </div>
            </Modal>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
