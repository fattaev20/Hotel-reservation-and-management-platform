#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <arpa/inet.h>

#define SERVER_IP "192.168.72.207" // Server IP address
#define SERVER_PORT 8080          // Server port
#define BUFFER_SIZE 8192          // Chunk size for receiving data

// Function to check if a JSON response is complete
int is_complete_json(const char *data) {
    // Simple heuristic: Check if the response ends with '}' or ']'
    size_t len = strlen(data);
    if (len > 0 && (data[len - 1] == '}' || data[len - 1] == ']')) {
        return 1; // JSON response is complete
    }
    return 0;
}

void send_to_server(const char *message) {
    int sock;
    struct sockaddr_in server_addr;
    char buffer[BUFFER_SIZE];

    // Create socket
    sock = socket(AF_INET, SOCK_STREAM, 0);
    if (sock < 0) {
        perror("Error creating socket");
        return;
    }

    // Configure server address
    server_addr.sin_family = AF_INET;
    server_addr.sin_port = htons(SERVER_PORT);
    inet_pton(AF_INET, SERVER_IP, &server_addr.sin_addr);

    // Connect to server
    if (connect(sock, (struct sockaddr *)&server_addr, sizeof(server_addr)) < 0) {
        perror("Error connecting to server");
        close(sock);
        return;
    }

    // Send message to server
    if (send(sock, message, strlen(message), 0) < 0) {
        perror("Error sending data");
        close(sock);
        return;
    }

    // Open a file to save the response
    FILE *output_file = fopen("response.txt", "w");
    if (output_file == NULL) {
        perror("Error opening file for writing");
        close(sock);
        return;
    }

    printf("Response from server:\n");

    // Receive response in chunks
    int json_complete = 0; // Flag to check if response is complete
    while (1) {
        ssize_t bytes_received = recv(sock, buffer, BUFFER_SIZE - 1, 0);
        if (bytes_received < 0) {
            perror("Error receiving data");
            fclose(output_file);
            close(sock);
            return;
        } else if (bytes_received == 0) {
            // Connection closed by server
            printf("\nEnd of response: Connection closed by server.\n");
            break;
        }

        buffer[bytes_received] = '\0';

        // Write the chunk to the file
        fwrite(buffer, 1, bytes_received, output_file);

        // Optional: Print the chunk to the console
        printf("%s", buffer);

        // Check if JSON response is complete
        if (is_complete_json(buffer)) {
            json_complete = 1;
            printf("\n");
            // printf("\nEnd of response detected by JSON heuristic.\n");
            break;
        }
    }

    if (!json_complete) {
        printf("\nWarning: Response may be incomplete.\n");
    }

    // Clean up
    fclose(output_file);
    close(sock);
}

int main(int argc, char *argv[]) {
    if (argc != 2) {
        printf("Usage: %s '<JSON request>'\n", argv[0]);
        return 1;
    }

    char *request = argv[1];
    char response;

    printf("Sending request to server: %s\n", request);
    send_to_server(request);

    return 0;
}


