const { exec } = require('child_process');

function sendRequestToServer(jsonRequest) {
    const command = `./client '${JSON.stringify(jsonRequest)}'`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing client: ${error.message}`);
            return;
        }

        if (stderr) {
            console.error(`Error: ${stderr}`);
            return;
        }

        console.log(`Response: ${stdout}`);
    });
}

// Example usage
const request = {
    action: "register_guest",
    FullName: "John Doe",
    DateOfBirth: "1990-01-01",
    Address: "123 Main St",
    Phone: "1234567890",
    PassportSeries: "A12345",
    Email: "john@example.com"
};

sendRequestToServer(request);
