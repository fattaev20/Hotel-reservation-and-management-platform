import socket
import random
import threading
import json
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
import mysql.connector
import bcrypt

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root:Az_20iz_07@localhost/hotel'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Database models
with app.app_context():
    class Hotel(db.Model):
        __table__ = db.Table('Hotel', db.metadata, autoload_with=db.engine)

    class Client(db.Model):
        __table__ = db.Table('Client', db.metadata, autoload_with=db.engine)

    class Staff(db.Model):
        __table__ = db.Table('Staff', db.metadata, autoload_with=db.engine)

    class Booking(db.Model):
        __table__ = db.Table('Booking', db.metadata, autoload_with=db.engine)


# Function to handle C server communication
# Function to handle C server communication
def handle_c_server_connection(connection, address):
    print(f"Connected to C server at {address}")
    BUFFER_SIZE = 1024

    try:
        while True:
            data = connection.recv(BUFFER_SIZE).decode('utf-8')
            if not data:
                break

            print(f"Received data from C server: {data}")
            request = json.loads(data)

            with app.app_context():  # Ensure Flask application context is active
                # Route the request to appropriate handlers
                if request.get("action") == "register_guest":
                    response = register_guest(request)
                elif request.get("action") == "register_guest_2":
                    response = register_guest_2(request)
                elif request.get("action") == "register_staff":
                    response = register_staff(request)
                elif request.get("action") == "register_staff_2":
                    response = register_staff_2(request)
                elif request.get("action") == "login_guest":
                    response = login_guest(request)
                elif request.get("action") == "login_staff":
                    response = login_staff(request)
                elif request.get("action") == "find_hotel":
                    response = find_hotel(request)
                elif request.get("action") == "get_booking_request_details":
                    response = get_booking_request_details(request)
                else:
                    response = {"status": "error", "message": "Invalid action"}

            # Send response back to C server
            connection.send(json.dumps(response).encode('utf-8'))

    except Exception as e:
        print(f"Error handling C server connection: {str(e)}")

    finally:
        print(f"Closing connection with C server at {address}")
        connection.close()



# Start the TCP server for the C server
def start_tcp_server():
    SERVER_IP = '127.0.0.1'
    SERVER_PORT = 9999

    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)  # Enable reuse of the port
    try:
        server_socket.bind((SERVER_IP, SERVER_PORT))
        server_socket.listen(5)
        print(f"Listening on {SERVER_IP}:{SERVER_PORT}...")

        while True:
            connection, address = server_socket.accept()
            print(f"Connection established with {address}")
            threading.Thread(target=handle_c_server_connection, args=(connection, address)).start()

    except Exception as e:
        print(f"Error in TCP server: {str(e)}")
    finally:
        server_socket.close()



# Flask handlers
def register_guest(data):
    # Define the fields that are valid for the Client model
    valid_fields = ['FullName', 'DateOfBirth', 'Address', 'Phone', 'PassportSeries', 'Email']

    # Filter the data to include only valid fields
    filtered_data = {key: data[key] for key in valid_fields if key in data}

    # Check if all required fields are provided
    if not all(field in filtered_data for field in valid_fields):
        return {'status': 'error', 'message': 'Missing required fields'}

    try:
        # Generate unique ClientID
        while True:
            random_client_id = random.randint(100, 999)
            existing_client = Client.query.filter_by(ClientID=random_client_id).first()
            if not existing_client:
                break

        # Add the ClientID to the filtered data
        filtered_data['ClientID'] = random_client_id

        # Add new guest to the database
        guest = Client(**filtered_data)
        db.session.add(guest)
        db.session.commit()

        return {'status': 'success', 'message': 'Guest registered successfully', 'id': random_client_id}
    except Exception as e:
        return {'status': 'error', 'message': str(e)}


def register_guest_2(data):
    # Define the fields that are valid for this operation
    valid_fields = ['ClientID', 'Username', 'Password']

    # Filter the data to include only valid fields
    filtered_data = {key: data[key] for key in valid_fields if key in data}

    # Check if all required fields are provided
    if not all(field in filtered_data for field in valid_fields):
        return {'status': 'error', 'message': 'Missing required fields'}

    try:
        # Fetch the guest by ClientID
        client = Client.query.filter_by(ClientID=filtered_data['ClientID']).first()
        if not client:
            return {'status': 'error', 'message': 'Invalid ClientID'}

        # Hash the password before storing it (recommended for security)
        hashed_password = bcrypt.hashpw(filtered_data['Password'].encode('utf-8'), bcrypt.gensalt())

        # Update the guest with Username and Password
        client.Username = filtered_data['Username']
        client.Password = hashed_password.decode('utf-8')  # Store the hashed password as a string
        db.session.commit()

        return {'status': 'success', 'message': 'Guest credentials updated successfully'}
    except Exception as e:
        return {'status': 'error', 'message': str(e)}



def register_staff(data):
    # Define the fields that are valid for the Staff model
    valid_fields = ['FullName', 'DateOfBirth', 'Address', 'Phone', 'PassportSeries', 'Email', 'HotelID', 'Position']

    # Filter the data to include only valid fields
    filtered_data = {key: data[key] for key in valid_fields if key in data}

    # Check if all required fields are provided
    if not all(field in filtered_data for field in valid_fields):
        return {'status': 'error', 'message': 'Missing required fields'}

    try:
        # Generate unique StaffID
        while True:
            random_staff_id = random.randint(100, 999)
            existing_staff = Staff.query.filter_by(StaffID=random_staff_id).first()
            if not existing_staff:
                break

        # Add the StaffID to the filtered data
        filtered_data['StaffID'] = random_staff_id

        # Add new staff to the database
        staff = Staff(**filtered_data)
        db.session.add(staff)
        db.session.commit()

        return {'status': 'success', 'message': 'Staff registered successfully', 'id': random_staff_id}
    except Exception as e:
        return {'status': 'error', 'message': str(e)}


def register_staff_2(data):
    # Define the fields that are valid for this operation
    valid_fields = ['StaffID', 'Username', 'Password']

    # Filter the data to include only valid fields
    filtered_data = {key: data[key] for key in valid_fields if key in data}

    # Check if all required fields are provided
    if not all(field in filtered_data for field in valid_fields):
        return {'status': 'error', 'message': 'Missing required fields'}

    try:
        # Fetch the staff by StaffID
        staff = Staff.query.filter_by(StaffID=filtered_data['StaffID']).first()
        if not staff:
            return {'status': 'error', 'message': 'Invalid StaffID'}

        # Hash the password before storing it (recommended for security)
        hashed_password = bcrypt.hashpw(filtered_data['Password'].encode('utf-8'), bcrypt.gensalt())

        # Update the staff with Username and Password
        staff.Username = filtered_data['Username']
        staff.Password = hashed_password.decode('utf-8')  # Store the hashed password as a string
        db.session.commit()

        return {'status': 'success', 'message': 'Staff credentials updated successfully'}
    except Exception as e:
        return {'status': 'error', 'message': str(e)}




def login_guest(data):
    # Define the fields that are valid for this operation
    valid_fields = ['Username', 'Password']

    # Filter the data to include only valid fields
    filtered_data = {key: data[key] for key in valid_fields if key in data}

    # Check if all required fields are provided
    if not all(field in filtered_data for field in valid_fields):
        return {'status': 'error', 'message': 'Missing required fields'}

    try:
        # Fetch the guest by Username
        guest = Client.query.filter_by(Username=filtered_data['Username']).first()
        if not guest:
            return {'status': 'error', 'message': 'Invalid username or password'}

        # Verify the provided password against the hashed password
        if not bcrypt.checkpw(filtered_data['Password'].encode('utf-8'), guest.Password.encode('utf-8')):
            return {'status': 'error', 'message': 'Invalid username or password'}

        # Successful login
        return {
            'status': 'success',
            'message': 'Login successful',
            'guest': {
                'ClientID': guest.ClientID,
                'Username': guest.Username,
                'FullName': guest.FullName
            }
        }
    except Exception as e:
        return {'status': 'error', 'message': str(e)}



def login_staff(data):
    # Define the fields that are valid for this operation
    valid_fields = ['Username', 'Password']

    # Filter the data to include only valid fields
    filtered_data = {key: data[key] for key in valid_fields if key in data}

    # Check if all required fields are provided
    if not all(field in filtered_data for field in valid_fields):
        return {'status': 'error', 'message': 'Missing required fields'}

    try:
        # Fetch the staff by Username
        staff = Staff.query.filter_by(Username=filtered_data['Username']).first()
        if not staff:
            return {'status': 'error', 'message': 'Invalid username or password'}

        # Verify the provided password against the hashed password
        if not bcrypt.checkpw(filtered_data['Password'].encode('utf-8'), staff.Password.encode('utf-8')):
            return {'status': 'error', 'message': 'Invalid username or password'}

        # Successful login
        return {
            'status': 'success',
            'message': 'Login successful',
            'staff': {
                'StaffID': staff.StaffID,
                'Username': staff.Username,
                'FullName': staff.FullName,
                'Position': staff.Position
            }
        }
    except Exception as e:
        return {'status': 'error', 'message': str(e)}


def find_hotel(data):
    # Define the fields that are valid for the Hotel model
    valid_fields = ['keyword']

    # Filter the data to include only valid fields
    filtered_data = {key: data[key] for key in valid_fields if key in data}

    # Check if the required field 'keyword' is provided
    if 'keyword' not in filtered_data or not filtered_data['keyword']:
        return {'status': 'error', 'message': 'Missing or empty keyword'}

    try:
        # Perform a case-insensitive search for hotels
        keyword = filtered_data['keyword']
        hotels = Hotel.query.filter(Hotel.Name.ilike(f"%{keyword}%")).all()

        if not hotels:
            return {'status': 'error', 'message': 'No hotels found'}

        # Prepare the response with the list of hotels
        result = [{'HotelID': hotel.HotelID, 'Name': hotel.Name} for hotel in hotels]
        return {'status': 'success', 'hotels': result}
    except Exception as e:
        return {'status': 'error', 'message': str(e)}


def get_booking_request_details(data):
    # Ensure 'booking_id' is provided in the request data
    booking_id = data.get('BookingID')
    if not booking_id:
        return {'status': 'error', 'message': 'Missing booking_id'}

    try:
        # Query the Booking table for the specified booking_id
        booking = Booking.query.filter_by(BookingID=booking_id).first()

        # Check if a booking with the given ID exists
        if not booking:
            return {'status': 'error', 'message': 'Booking not found'}

        # Prepare the booking details to be returned
        booking_details = {
            'booking_id': booking.BookingID,
            'client_id': booking.ClientID,
            'hotel_id': booking.HotelID,
            'room_number': booking.RoomNumber,
            'adults_number': booking.AdultsNumber,
            'children_number': booking.ChildrenNumber,
            'checkin_date': booking.CheckinDate.strftime('%Y-%m-%d'),
            'checkout_date': booking.CheckoutDate.strftime('%Y-%m-%d'),
            'total_price': float(booking.TotalPrice)
        }

        return {'status': 'success', 'booking_details': booking_details}

    except Exception as e:
        return {'status': 'error', 'message': str(e)}

if __name__ == '__main__':
    threading.Thread(target=start_tcp_server).start()
    app.run(host='0.0.0.0', port=9999, debug=True)

