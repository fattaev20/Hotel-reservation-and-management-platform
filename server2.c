#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <pthread.h>
#include <arpa/inet.h>

#define SERVER_PORT 8080       // Port for the C server to listen on
#define FLASK_PORT 9999        // Port for Flask backend
#define FLASK_IP "127.0.0.1"   // Flask backend address
#define BUFFER_SIZE 1024

// Function to communicate with Flask backend
void communicate_with_flask(const char *message, char *response) {
    int flask_sock;
    struct sockaddr_in flask_addr;
    char buffer[BUFFER_SIZE];

    // Create socket for Flask communication
    flask_sock = socket(AF_INET, SOCK_STREAM, 0);
    if (flask_sock < 0) {
        perror("Error creating socket for Flask communication");
        strcpy(response, "{\"status\":\"error\",\"message\":\"Failed to create socket\"}");
        return;
    }

    // Configure Flask address
    flask_addr.sin_family = AF_INET;
    flask_addr.sin_port = htons(9999); // Match Flask port
    inet_pton(AF_INET, "127.0.0.1", &flask_addr.sin_addr); // Match Flask IP

    // Connect to Flask
    if (connect(flask_sock, (struct sockaddr *)&flask_addr, sizeof(flask_addr)) < 0) {
        perror("Error connecting to Flask backend");
        strcpy(response, "{\"status\":\"error\",\"message\":\"Failed to connect to Flask\"}");
        close(flask_sock);
        return;
    }

    // Send message to Flask
    if (send(flask_sock, message, strlen(message), 0) < 0) {
        perror("Error sending data to Flask");
        strcpy(response, "{\"status\":\"error\",\"message\":\"Failed to send data to Flask\"}");
        close(flask_sock);
        return;
    }

    // Receive response from Flask
    int bytes_received = read(flask_sock, buffer, BUFFER_SIZE);
    if (bytes_received > 0) {
        buffer[bytes_received] = '\0';
        strcpy(response, buffer);
    } else {
        strcpy(response, "{\"status\":\"error\",\"message\":\"No response from Flask\"}");
    }

    close(flask_sock);
}


// Function to handle client connections
void *handle_client(void *socket_desc) {
    int client_sock = *(int *)socket_desc;
    char client_message[BUFFER_SIZE];
    char flask_response[BUFFER_SIZE];

    printf("Client connected\n");

    // Communicate with the client
    while (1) {
        memset(client_message, 0, BUFFER_SIZE);

        // Read message from client
        int read_size = read(client_sock, client_message, BUFFER_SIZE);
        if (read_size <= 0) {
            printf("Client disconnected\n");
            break;
        }

        client_message[read_size] = '\0';
        printf("Received from client: %s\n", client_message);

        // Forward the message to Flask and get response
        communicate_with_flask(client_message, flask_response);

        // Send Flask's response back to the client
        send(client_sock, flask_response, strlen(flask_response), 0);
    }

    close(client_sock);
    free(socket_desc);
    return NULL;
}

int main() {
    int server_sock, client_sock, *new_sock;
    struct sockaddr_in server_addr, client_addr;
    socklen_t client_addr_size = sizeof(client_addr);
    pthread_t thread_id;

    // Create socket
    server_sock = socket(AF_INET, SOCK_STREAM, 0);
    if (server_sock < 0) {
        perror("Error creating server socket");
        exit(EXIT_FAILURE);
    }

    // Configure server address
    server_addr.sin_family = AF_INET;
    server_addr.sin_addr.s_addr = INADDR_ANY;
    server_addr.sin_port = htons(SERVER_PORT);

    // Bind the socket
    if (bind(server_sock, (struct sockaddr *)&server_addr, sizeof(server_addr)) < 0) {
        perror("Error binding server socket");
        close(server_sock);
        exit(EXIT_FAILURE);
    }

    // Start listening for connections
    if (listen(server_sock, 5) < 0) {
        perror("Error listening on server socket");
        close(server_sock);
        exit(EXIT_FAILURE);
    }

    printf("C server listening on port %d...\n", SERVER_PORT);

    // Accept client connections
    while ((client_sock = accept(server_sock, (struct sockaddr *)&client_addr, &client_addr_size))) {
        printf("New connection from %s:%d\n",
               inet_ntoa(client_addr.sin_addr),
               ntohs(client_addr.sin_port));

        // Allocate memory for the socket descriptor
        new_sock = malloc(1);
        *new_sock = client_sock;

        // Create a new thread for each client
        if (pthread_create(&thread_id, NULL, handle_client, (void *)new_sock) < 0) {
            perror("Error creating thread");
            free(new_sock);
            close(client_sock);
        }
    }

    if (client_sock < 0) {
        perror("Error accepting client connection");
        close(server_sock);
        exit(EXIT_FAILURE);
    }

    close(server_sock);
    return 0;
}
