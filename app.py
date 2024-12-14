import socket
import random
import threading
import json
import datetime

from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
import pymysql
import bcrypt

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:Az_20iz_07@localhost/hotel'
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


    class Payment(db.Model):
        __table__ = db.Table('Payment', db.metadata, autoload_with=db.engine)


    class Room(db.Model):
        __table__ = db.Table('Room', db.metadata, autoload_with=db.engine)


    class RoomType(db.Model):
        __table__ = db.Table('RoomType', db.metadata, autoload_with=db.engine)


    class CheckinDetails(db.Model):
        __table__ = db.Table('CheckinDetails', db.metadata, autoload_with=db.engine)


    class CheckOutDetails(db.Model):
        __table__ = db.Table('CheckOutDetails', db.metadata, autoload_with=db.engine)


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

# Registration
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


# Manager functions
def get_booking_request():
    try:
        # Query all clients from the Client table
        clients = Client.query.all()

        if not clients:
            return {'status': 'error', 'message': 'No clients found'}

        booking_details_list = []

        for client in clients:
            # Query the Booking table to get all bookings for the current client
            bookings = Booking.query.filter_by(ClientID=client.ClientID).all()

            if not bookings:
                continue  # Skip this client if they have no bookings

            for booking in bookings:
                # Query the Payment table to get payment information for the booking
                payment = Payment.query.filter_by(BookingID=booking.BookingID).first()
                amount_paid = payment.amount if payment else 0

                # Handle None values for duration and TotalPrice
                duration = booking.duration if booking.duration is not None else 0
                total_price_per_night = booking.TotalPrice if booking.TotalPrice is not None else 0

                # Calculate total cost safely
                try:
                    total_cost = duration * total_price_per_night
                except Exception as e:
                    return {'status': 'error', 'message': f'Error calculating total cost: {str(e)}'}

                # Prepare the booking details for this specific booking
                booking_details = {
                    'ClientID': client.ClientID,
                    'ClientName': client.FullName,
                    'Phone': client.Phone,
                    'CheckinDate': booking.CheckinDate.strftime('%Y-%m-%d') if booking.CheckinDate else 'N/A',
                    'CheckoutDate': booking.CheckoutDate.strftime('%Y-%m-%d') if booking.CheckoutDate else 'N/A',
                    'duration': duration,
                    'AdultsNumber': booking.AdultsNumber if booking.AdultsNumber is not None else 0,
                    'ChildrenNumber': booking.ChildrenNumber if booking.ChildrenNumber is not None else 0,
                    'RoomNumber': booking.RoomNumber if booking.RoomNumber is not None else 'N/A',
                    'typeID': booking.typeID if booking.typeID is not None else 'N/A',
                    'totalCost': total_cost,
                    'TotalPrice': amount_paid,
                    'PaymentStatus': 'Paid in Full' if amount_paid >= total_cost else "Guest didn't pay full price"
                }
                booking_details_list.append(booking_details)

        if not booking_details_list:
            return {'status': 'error', 'message': 'No bookings found'}

        return {'status': 'success', 'booking_details': booking_details_list}

    except Exception as e:
        return {'status': 'error', 'message': f'Unexpected error: {str(e)}'}


def get_check_in_details():
    try:
        # Query all clients from the Client table
        clients = Client.query.all()

        if not clients:
            return {'status': 'error', 'message': 'No clients found'}

        booking_details_list = []

        for client in clients:
            # Query the Booking table to get all bookings for the current client
            bookings = Booking.query.filter_by(ClientID=client.ClientID).all()

            if not bookings:
                continue  # Skip this client if they have no bookings

            for booking in bookings:
                # Query the Payment table to get payment information for the booking
                payment = Payment.query.filter_by(BookingID=booking.BookingID).first()
                amount_paid = payment.amount if payment else 0

                # Handle None values for duration and TotalPrice
                duration = booking.duration if booking.duration is not None else 0
                total_price_per_night = booking.TotalPrice if booking.TotalPrice is not None else 0

                # Calculate total cost safely
                try:
                    total_cost = duration * total_price_per_night
                except Exception as e:
                    return {'status': 'error', 'message': f'Error calculating total cost: {str(e)}'}

                # Check if the guest has paid the full price
                if amount_paid < total_cost:
                    return {'status': 'error', 'message': "Guest didn't pay full price"}

                # Prepare the check-in details for this specific booking
                booking_details = {
                    'ClientID': client.ClientID,
                    'ClientName': client.FullName,
                    'Phone': client.Phone,
                    'CheckinDate': booking.CheckinDate.strftime('%Y-%m-%d') if booking.CheckinDate else 'N/A',
                    'CheckoutDate': booking.CheckoutDate.strftime('%Y-%m-%d') if booking.CheckoutDate else 'N/A',
                    'duration': duration,
                    'AdultsNumber': booking.AdultsNumber if booking.AdultsNumber is not None else 0,
                    'ChildrenNumber': booking.ChildrenNumber if booking.ChildrenNumber is not None else 0,
                    'RoomNumber': booking.RoomNumber if booking.RoomNumber is not None else 'N/A',
                    'typeID': booking.typeID if booking.typeID is not None else 'N/A',
                    'totalCost': total_cost,
                    'TotalPrice': amount_paid
                }
                booking_details_list.append(booking_details)

        if not booking_details_list:
            return {'status': 'error', 'message': 'No bookings found'}

        return {'status': 'success', 'booking_details': booking_details_list}

    except Exception as e:
        return {'status': 'error', 'message': f'Unexpected error: {str(e)}'}


def get_check_out_details():
    try:
        # Query all bookings from the Booking table
        bookings = Booking.query.all()

        if not bookings:
            return {'status': 'error', 'message': 'No bookings found'}

        checkout_details_list = []

        for booking in bookings:
            # Query the CheckoutDetails table for the current BookingID
            checkout = CheckOutDetails.query.filter_by(BookingID=booking.BookingID).first()

            # If no checkout details are found, skip this booking
            if not checkout:
                continue

            # Query the Client table to get information for the ClientID associated with the booking
            client = Client.query.filter_by(ClientID=booking.ClientID).first()

            # If no client is found, skip this booking
            if not client:
                continue

            # Query the Payment table to get payment information for the booking
            payment = Payment.query.filter_by(BookingID=booking.BookingID).first()
            amount_paid = payment.amount if payment else 0

            # Calculate duration, total cost, and handle None values
            duration = booking.duration if booking.duration is not None else 0
            total_price_per_night = booking.TotalPrice if booking.TotalPrice is not None else 0

            try:
                total_cost = duration * total_price_per_night
            except Exception as e:
                return {'status': 'error', 'message': f'Error calculating total cost: {str(e)}'}

            # Query the Room table to get Room details
            room = Room.query.filter_by(RoomNumber=checkout.RoomNumber).first()

            room_type_id = room.TypeID if room else 'N/A'

            # Prepare the full checkout details to be returned
            checkout_details = {
                # Client Details
                'ClientID': client.ClientID,
                'ClientName': client.FullName,
                'Phone': client.Phone,

                # Booking Details
                'CheckinDate': booking.CheckinDate.strftime('%Y-%m-%d') if booking.CheckinDate else 'N/A',
                'CheckoutDate': booking.CheckoutDate.strftime('%Y-%m-%d') if booking.CheckoutDate else 'N/A',
                'duration': duration,
                'AdultsNumber': booking.AdultsNumber if booking.AdultsNumber is not None else 0,
                'ChildrenNumber': booking.ChildrenNumber if booking.ChildrenNumber is not None else 0,
                'RoomNumber': booking.RoomNumber if booking.RoomNumber is not None else 'N/A',
                'typeID': booking.typeID if booking.typeID is not None else room_type_id,

                # Cost Details
                'totalCost': total_cost,
                'TotalPrice': amount_paid,

                # Checkout Details
                'CheckoutDetailsID': checkout.CheckoutDetailsID,
                'MissingEquipment': checkout.MissingEquipment if checkout.MissingEquipment else 'N/A',
                'BrokenEquipment': checkout.BrokenEquipment if checkout.BrokenEquipment else 'N/A',
                'RestaurantFee': checkout.RestaurantFee if checkout.RestaurantFee is not None else 0,
                'BarFee': checkout.BarFee if checkout.BarFee is not None else 0,
                'AdditionalFee': checkout.AdditionalFee if checkout.AdditionalFee is not None else 0,
                'RoomServiceFee': checkout.RoomServiceFee if checkout.RoomServiceFee is not None else 0,
                'CheckStatus': checkout.CheckStatus if checkout.CheckStatus else 'N/A',
                'CheckoutTotalPrice': checkout.TotalPrice if checkout.TotalPrice is not None else 0
            }

            checkout_details_list.append(checkout_details)

        if not checkout_details_list:
            return {'status': 'error', 'message': 'No checkout details found'}

        return {'status': 'success', 'checkout_details': checkout_details_list}

    except Exception as e:
        return {'status': 'error', 'message': f'Unexpected error: {str(e)}'}


def approve_booking_requests(data):
    # Extract the BookingID from the data
    booking_id = data.get('BookingID')
    if not booking_id:
        return {'status': 'error', 'message': 'Missing BookingID'}

    try:
        # Retrieve the booking details based on the BookingID
        booking = Booking.query.filter_by(BookingID=booking_id).first()
        if not booking:
            return {'status': 'error', 'message': 'Booking not found'}

        # Retrieve the Room associated with this booking
        room = Room.query.filter_by(RoomNumber=booking.RoomNumber, HotelID=booking.HotelID).first()
        if not room:
            return {'status': 'error', 'message': 'Room not found'}

        # Update the room's status to 'booked'
        room.Status = 'booked'
        db.session.commit()

        return {'status': 'success', 'message': f'Room {room.RoomNumber} has been successfully booked'}
    except Exception as e:
        return {'status': 'error', 'message': str(e)}


def approve_check_in_details(data):
    # Extract the ClientID from the data
    client_id = data.get('ClientID')
    if not client_id:
        return {'status': 'error', 'message': 'Missing ClientID'}

    try:
        # Retrieve the booking details associated with the ClientID
        booking = Booking.query.filter_by(ClientID=client_id).first()
        if not booking:
            return {'status': 'error', 'message': 'Booking not found for the given ClientID'}

        # Retrieve the Room associated with this booking
        room = Room.query.filter_by(RoomNumber=booking.RoomNumber, HotelID=booking.HotelID).first()
        if not room:
            return {'status': 'error', 'message': 'Room not found'}

        # Update the room's status to 'booked'
        room.Status = 'booked'
        db.session.commit()

        return {'status': 'success',
                'message': f'Room {room.RoomNumber} has been successfully booked for ClientID {client_id}'}
    except Exception as e:
        return {'status': 'error', 'message': str(e)}


def approve_check_out_details(data):
    # Extract the ClientID from the request data
    client_id = data.get('ClientID')
    if not client_id:
        return {'status': 'error', 'message': 'Missing ClientID'}

    try:
        # Retrieve the booking details associated with the ClientID
        booking = Booking.query.filter_by(ClientID=client_id).first()
        if not booking:
            return {'status': 'error', 'message': 'Booking not found for the given ClientID'}

        # Retrieve the Room associated with this booking
        room = Room.query.filter_by(RoomNumber=booking.RoomNumber, HotelID=booking.HotelID).first()
        if not room:
            return {'status': 'error', 'message': 'Room not found'}

        # Check if the room is currently booked, if not return an error
        if room.Status != 'booked':
            return {'status': 'error', 'message': f'Room {room.RoomNumber} is not currently marked as booked'}

        # Update the room's status from 'booked' to 'available'
        room.Status = 'available'
        db.session.commit()

        return {'status': 'success',
                'message': f'Room {room.RoomNumber} has been successfully marked as available for ClientID {client_id}'}
    except Exception as e:
        return {'status': 'error', 'message': str(e)}


def cancel_check_in(ClientID):
    if not ClientID:
        return {'status': 'error', 'message': 'Missing ClientID'}

    try:
        # Query all bookings associated with the provided ClientID
        bookings = Booking.query.filter_by(ClientID=ClientID).all()

        if not bookings:
            return {'status': 'error', 'message': 'No bookings found for this client'}

        updated_rooms = []

        for booking in bookings:
            # Get the room associated with the booking
            room = Room.query.filter_by(RoomNumber=booking.RoomNumber).first()

            if not room:
                return {'status': 'error', 'message': f'Room with RoomNumber {booking.RoomNumber} not found'}

            # Check if the room is currently booked
            if room.Status != 'booked':
                continue  # If the room is not "booked", no need to update it

            # Update the room status to "free"
            room.Status = 'free'

            # Save the room changes
            db.session.commit()

            updated_rooms.append(room.RoomNumber)

        if not updated_rooms:
            return {'status': 'error', 'message': 'No booked rooms were found for this client to cancel'}

        return {'status': 'success', 'message': 'Check-in successfully canceled', 'updated_rooms': updated_rooms}

    except Exception as e:
        db.session.rollback()  # Roll back the transaction if there is an error
        return {'status': 'error', 'message': f'Unexpected error: {str(e)}'}


# Client Functions
def get_city():
    try:
        # Query the City table to get all cities
        cities = City.query.all()

        # If no cities are found, return an error message
        if not cities:
            return {'status': 'error', 'message': 'No cities found'}

        # Prepare the list of city names to be returned
        city_names = [city.CityName for city in cities]

        return {'status': 'success', 'cities': city_names}

    except Exception as e:
        return {'status': 'error', 'message': str(e)}


def get_hotels(city):
    try:
        # Query the Hotel table to find hotels in the specified city
        hotels = Hotel.query.filter_by(city_name=city).all()

        # If no hotels are found for the city, return an error message
        if not hotels:
            return {'status': 'error', 'message': f'No hotels found in {city}'}

        # Prepare the list of hotel names to be returned
        hotel_list = [{
            'hotel_name': hotel.name,
            'hotel_id': hotel.hotel_id,
            'city': hotel.city_name,
            'address': hotel.address,
            'rating': hotel.rating
        } for hotel in hotels]

        return {'status': 'success', 'hotels': hotel_list}

    except Exception as e:
        return {'status': 'error', 'message': str(e)}


def make_booking(data):
    valid_fields = ['ClientID', 'HotelID', 'RoomType', 'AdultsNumber', 'ChildrenNumber', 'BabiesNumber', 'CheckinDate',
                    'CheckoutDate']

    # Filter the input data to include only valid fields
    filtered_data = {key: data[key] for key in valid_fields if key in data}

    # Check if all required fields are provided and not empty
    required_fields = ['ClientID', 'HotelID', 'RoomType', 'AdultsNumber', 'CheckinDate', 'CheckoutDate']
    if not all(field in filtered_data and filtered_data[field] for field in required_fields):
        return {'status': 'error', 'message': 'Missing required fields'}

    try:
        # Parse and validate the dates
        checkin_date = datetime.datetime.strptime(filtered_data['CheckinDate'], '%Y-%m-%d')
        checkout_date = datetime.datetime.strptime(filtered_data['CheckoutDate'], '%Y-%m-%d')
        if checkout_date <= checkin_date:
            return {'status': 'error', 'message': 'Checkout date must be after the checkin date'}

        # Check the availability of the room type
        hotel_id = filtered_data['HotelID']
        room_type = filtered_data['RoomType']
        existing_booking = Booking.query.filter_by(
            HotelID=hotel_id,
            RoomType=room_type,
            CheckinDate=checkin_date,
            CheckoutDate=checkout_date
        ).first()
        if existing_booking:
            return {'status': 'error', 'message': 'Selected room type is not available for the given dates'}

        # Generate unique BookingID
        while True:
            random_booking_id = random.randint(1000, 9999)
            existing_booking_id = Booking.query.filter_by(BookingID=random_booking_id).first()
            if not existing_booking_id:
                break

        # Add the BookingID to the data
        filtered_data['BookingID'] = random_booking_id

        # Add the booking information to the database
        booking = Booking(**filtered_data)
        db.session.add(booking)
        db.session.commit()

        return {'status': 'success', 'message': 'Booking successful', 'BookingID': random_booking_id}
    except Exception as e:
        return {'status': 'error', 'message': str(e)}


def calculate_total_cost(data):
    required_fields = ['HotelID', 'RoomType', 'AdultsNumber', 'ChildrenNumber', 'BabiesNumber', 'CheckinDate',
                       'CheckoutDate']

    # Ensure all required fields are provided and valid
    if not all(field in data and data[field] for field in required_fields):
        return {'status': 'error', 'message': 'Missing required fields'}

    try:
        # Extract fields from the input data
        hotel_id = data['HotelID']
        room_type = data['RoomType']
        adults = int(data['AdultsNumber'])
        children = int(data['ChildrenNumber'])
        babies = int(data['BabiesNumber'])
        checkin_date = datetime.datetime.strptime(data['CheckinDate'], '%Y-%m-%d')
        checkout_date = datetime.datetime.strptime(data['CheckoutDate'], '%Y-%m-%d')

        # Ensure valid dates
        if checkout_date <= checkin_date:
            return {'status': 'error', 'message': 'Checkout date must be after check-in date'}

        # Calculate the number of days for the stay
        total_days = (checkout_date - checkin_date).days

        # Query the RoomType table to get pricing details for the specified RoomType and HotelID
        room = RoomType.query.filter_by(HotelID=hotel_id, Name=room_type).first()
        if not room:
            return {'status': 'error', 'message': 'Invalid room type or room not found'}

        # Extract price details from the RoomType table
        price_per_adult = room.PriceAdult  # Price per adult per day
        price_per_child = room.PriceChildren  # Price per child per day
        price_per_baby = room.PriceBaby

        # Calculate the total cost
        total_cost = (price_per_adult * adults + price_per_child * children) * total_days

        return {
            'status': 'success',
            'message': 'Cost calculated successfully',
            'data': {
                'TotalCost': total_cost,
                'Details': {
                    'Adults': adults,
                    'Children': children,
                    'Babies': babies,
                    'RoomType': room_type,
                    'PricePerAdult': price_per_adult,
                    'PricePerChild': price_per_child,
                    'Days': total_days
                }
            }
        }

    except Exception as e:
        return {'status': 'error', 'message': str(e)}


def process_payment(data):
    # Validate required fields in the request
    required_fields = ['BookingID', 'PaymentType', 'CardNumber', 'ExpiryDate', 'CVV']
    if not all(field in data and data[field] for field in required_fields):
        return {'status': 'error', 'message': 'Missing required fields'}

    try:
        # Extract the inputs
        booking_id = data['BookingID']
        payment_type = data['PaymentType']  # "full" or "30%"
        card_number = data['CardNumber']
        expiry_date = data['ExpiryDate']
        cvv = data['CVV']

        # Validate card details (optional: use external library or service)
        if len(card_number) != 16 or not card_number.isdigit():
            return {'status': 'error', 'message': 'Invalid card number'}
        if len(cvv) != 3 or not cvv.isdigit():
            return {'status': 'error', 'message': 'Invalid CVV'}
        if not validate_expiry_date(expiry_date):
            return {'status': 'error', 'message': 'Card has expired'}

        # Fetch the booking details from the database
        booking = Booking.query.filter_by(BookingID=booking_id).first()
        if not booking:
            return {'status': 'error', 'message': 'Invalid BookingID'}

        total_amount = calculate_total_cost({
            'HotelID': booking.HotelID,
            'RoomType': booking.RoomType,
            'AdultsNumber': booking.AdultsNumber,
            'ChildrenNumber': booking.ChildrenNumber,
            'BabiesNumber': booking.BabiesNumber,
            'CheckinDate': booking.CheckinDate.strftime('%Y-%m-%d'),
            'CheckoutDate': booking.CheckoutDate.strftime('%Y-%m-%d'),
        })['data']['TotalCost']

        # Determine the amount to pay based on payment type
        paid_amount = total_amount if payment_type == 'full' else total_amount * 0.3

        # Record the payment in the database (excluding sensitive card info)
        payment = Payment(
            BookingID=booking_id,
            TotalAmount=total_amount,
            PaidAmount=paid_amount,
            PaymentStatus="Completed",
            PaymentMethod="Credit Card",
            TransactionDate=datetime.datetime.now()
        )
        db.session.add(payment)
        db.session.commit()

        # Return a success response
        return {
            'status': 'success',
            'message': f'Payment of {"full cost" if payment_type == "full" else "30%"} completed successfully.',
            'data': {
                'BookingID': booking_id,
                'PaidAmount': paid_amount,
                'PaymentType': payment_type,
                'TotalCost': total_amount
            }
        }

    except Exception as e:
        return {'status': 'error', 'message': str(e)}


# Roomboy Functions
def get_room_checking_status(data):
    # Ensure the input contains RoomNumber
    room_number = data.get('RoomNumber')
    if not room_number:
        return {'status': 'error', 'message': 'Missing RoomNumber'}

    try:
        # Query the Room table and join with CheckOutDetails
        result = db.session.query(
            db.Room.RoomNumber,
            db.Room.TypeID,
            db.CheckOutDetails.CheckoutDate,
            db.Room.Status
        ).outerjoin(db.CheckOutDetails, db.Room.RoomNumber == db.CheckOutDetails.RoomNumber).filter(
            db.Room.RoomNumber == room_number
        ).first()

        # Check if the room exists
        if not result:
            return {'status': 'error', 'message': 'Room not found'}

        # Prepare and return the response
        response = {
            'RoomNumber': result.RoomNumber,
            'TypeID': result.TypeID,
            'CheckoutDate': result.CheckoutDate.strftime('%Y-%m-%d') if result.CheckoutDate else None,
            'Status': result.Status
        }
        return {'status': 'success', 'data': response}

    except Exception as e:
        return {'status': 'error', 'message': str(e)}


def room_checking(data):
    # Extract input from the front-end
    room_number = data.get('RoomNumber')
    restaurant_fee = data.get('RestaurantFee', 0.0)
    bar_fee = data.get('BarFee', 0.0)
    room_service_fee = data.get('RoomServiceFee', 0.0)
    missing_equipment = data.get('MissingEquipment', None)
    broken_equipment = data.get('BrokenEquipment', None)
    additional_fees = data.get('AdditionalFees', 0.0)

    if not room_number:
        return {'status': 'error', 'message': 'Missing RoomNumber'}

    try:
        # Verify the room's existence
        room = db.Room.query.filter_by(RoomNumber=room_number).first()
        if not room:
            return {'status': 'error', 'message': 'Room not found'}

        # Query existing CheckOutDetails for this room
        checkout_details = db.CheckOutDetails.query.filter_by(RoomNumber=room_number).first()

        # If no CheckOutDetails exists, create a new one
        if not checkout_details:
            checkout_details = db.CheckOutDetails(
                RoomNumber=room_number,
                RestaurantFee=restaurant_fee,
                BarFee=bar_fee,
                RoomServiceFee=room_service_fee,
                MissingEquipment=missing_equipment,
                BrokenEquipment=broken_equipment,
                TotalPrice=restaurant_fee + bar_fee + room_service_fee + additional_fees,
                CheckoutDate=datetime.date.today()
            )
            db.session.add(checkout_details)
        else:
            # Update existing CheckOutDetails for the room
            checkout_details.RestaurantFee = restaurant_fee
            checkout_details.BarFee = bar_fee
            checkout_details.RoomServiceFee = room_service_fee
            checkout_details.MissingEquipment = missing_equipment
            checkout_details.BrokenEquipment = broken_equipment
            checkout_details.TotalPrice = (
                    restaurant_fee + bar_fee + room_service_fee + additional_fees
            )
            checkout_details.CheckoutDate = datetime.date.today()  # Update check-out date

        # Commit changes to the database
        db.session.commit()

        return {'status': 'success', 'message': 'Room checkout details updated successfully'}

    except Exception as e:
        # Handle potential errors during the database transaction
        db.session.rollback()
        return {'status': 'error', 'message': str(e)}


if __name__ == '__main__':
    threading.Thread(target=start_tcp_server).start()
    app.run(host='0.0.0.0', port=9999, debug=True)
