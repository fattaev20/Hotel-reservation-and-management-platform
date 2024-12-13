#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <arpa/inet.h>

#define SERVER_IP "192.168.1.22" // IP address of the C server
#define SERVER_PORT 8080      // Port of the C server
#define BUFFER_SIZE 1024

void send_to_server(const char *message, char *response) {
    int sock;
    struct sockaddr_in server_addr;
    char buffer[BUFFER_SIZE];

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

    // Receive response from server
    int bytes_received = recv(sock, buffer, BUFFER_SIZE - 1, 0);
    if (bytes_received < 0) {
        perror("Error receiving data");
        strcpy(response, "{\"status\":\"error\",\"message\":\"Failed to receive data\"}");
    } else {
        buffer[bytes_received] = '\0';
        strcpy(response, buffer);
    }

    close(sock);
}

int main(int argc, char *argv[]) {
    if (argc != 2) {
        printf("Usage: %s '<JSON request>'\n", argv[0]);
        return 1;
    }

    char *request = argv[1];
    char response[BUFFER_SIZE];

    printf("Sending request to server: %s\n", request);
    send_to_server(request, response);

    printf("Response from server: %s\n", response);

    return 0;
}
