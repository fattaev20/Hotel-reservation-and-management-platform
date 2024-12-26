const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { exec } = require("child_process");

let mainWindow;

app.on("ready", () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false, // Do not enable this for security reasons
    },
  });

  // Load React app URL
  mainWindow.loadURL("http://localhost:5173"); // Adjust to your React app's URL
});

// Function to call the client executable
function sendRequestToServer(jsonRequest, callback) {
  const command = `./client '${JSON.stringify(jsonRequest)}'`; // Adjust path if needed

  exec(command, (error, stdout, stderr) => {
    if (error) {
      callback({ error: `Error executing client: ${error.message}` });
      return;
    }

    if (stderr) {
      callback({ error: `Error: ${stderr}` });
      return;
    }

    callback({ response: stdout });
  });
}

// IPC listener to handle messages from the frontend
ipcMain.handle("send-to-server", async (event, request) => {
  return new Promise((resolve) => {
    sendRequestToServer(request, (result) => {
      resolve(result);
    });
  });
});
