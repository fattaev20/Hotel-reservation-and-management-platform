#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <arpa/inet.h>

#define SERVER_IP "192.168.0.106" // Server IP address
#define SERVER_PORT 8080           // Server port
#define BUFFER_SIZE 8192           // Chunk size for receiving data
#define MAX_RESPONSE_SIZE 2097152  // Maximum expected response size (2MB)

void send_to_server(const char *message, char *response) {
    int sock;
    struct sockaddr_in server_addr;
    char buffer[BUFFER_SIZE];
    size_t total_bytes_received = 0;

    // Create socket
    sock = socket(AF_INET, SOCK_STREAM, 0);
    if (sock < 0) {
        perror("Error creating socket");
        strcpy(response, "{\"status\":\"error\",\"message\":\"Failed to create socket\"}");
        return;
    }

    // Configure server address
    server_addr.sin_family = AF_INET;
    server_addr.sin_port = htons(SERVER_PORT);
    inet_pton(AF_INET, SERVER_IP, &server_addr.sin_addr);

    // Connect to server
    if (connect(sock, (struct sockaddr *)&server_addr, sizeof(server_addr)) < 0) {
        perror("Error connecting to server");
        strcpy(response, "{\"status\":\"error\",\"message\":\"Failed to connect to server\"}");
        close(sock);
        return;
    }

    // Send message to server
    if (send(sock, message, strlen(message), 0) < 0) {
        perror("Error sending data");
        strcpy(response, "{\"status\":\"error\",\"message\":\"Failed to send data\"}");
        close(sock);
        return;
    }

    // Allocate memory for response
    char *dynamic_response = (char *)malloc(MAX_RESPONSE_SIZE);
    if (dynamic_response == NULL) {
        perror("Error allocating memory for response");
        strcpy(response, "{\"status\":\"error\",\"message\":\"Memory allocation failed\"}");
        close(sock);
        return;
    }
    memset(dynamic_response, 0, MAX_RESPONSE_SIZE);

    // Receive response from server
    while (1) {
        ssize_t bytes_received = recv(sock, buffer, BUFFER_SIZE - 1, 0);
        if (bytes_received < 0) {
            perror("Error receiving data");
            strcpy(response, "{\"status\":\"error\",\"message\":\"Failed to receive data\"}");
            free(dynamic_response);
            close(sock);
            return;
        } else if (bytes_received == 0) {
            // No more data from server (connection closed)
            break;
        }

        // Ensure buffer is null-terminated
        buffer[bytes_received] = '\0';

        // Append received data to the dynamic response
        if (total_bytes_received + bytes_received >= MAX_RESPONSE_SIZE) {
            perror("Error: Response size exceeds maximum limit");
            strcpy(response, "{\"status\":\"error\",\"message\":\"Response size exceeds limit\"}");
            free(dynamic_response);
            close(sock);
            return;
        }
        strcat(dynamic_response, buffer);
        total_bytes_received += bytes_received;

        // Optional: Break if the server sends an end marker (e.g., `\0` or custom marker)
        if (strstr(buffer, "\0")) {
            break;
        }
    }

    // Copy dynamic response to the response buffer
    strncpy(response, dynamic_response, MAX_RESPONSE_SIZE - 1);
    free(dynamic_response);

    close(sock);
}

int main(int argc, char *argv[]) {
    if (argc != 2) {
        printf("Usage: %s '<JSON request>'\n", argv[0]);
        return 1;
    }

    char *request = argv[1];
    char response[MAX_RESPONSE_SIZE];

    printf("Sending request to server: %s\n", request);
    send_to_server(request, response);

    // Print the server's response to the terminal
    printf("Response from server:\n%s\n", response);

    return 0;
}
