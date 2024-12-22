import socket
import random
import threading
import json
import datetime
from sqlite3 import ProgrammingError
from sqlalchemy.sql import text
from datetime import date, datetime
from decimal import Decimal
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
import pymysql
import bcrypt
from sqlalchemy import inspect, text
from sqlalchemy.testing.plugin.plugin_base import logging

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


    class CheckoutDetails(db.Model):
        __table__ = db.Table('CheckoutDetails', db.metadata, autoload_with=db.engine)


    class City(db.Model):
        __table__ = db.Table('City', db.metadata, autoload_with=db.engine)


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
                # Registration functions
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

                # Client functions
                elif request.get("action") == "get_city":
                    response = get_city()
                elif request.get("action") == "get_hotels":
                    response = get_hotels(request)


                # Manager functions
                elif request.get("action") == "get_booking_request":
                    response = get_booking_request()

                elif request.get("action") == "get_booking_request_by_id":
                    response = get_booking_request_by_id(request)

                elif request.get("action") == "get_check_in_details":
                    response = get_check_in_details()

                elif request.get("action") == "get_check_out_details":
                    response = get_check_out_details()

                elif request.get("action") == "get_check_in_details_by_id":
                    response = get_check_in_details_by_id(request)

                elif request.get("action") == "get_check_out_details_by_id":
                    response = get_check_out_details_by_id(request)

                elif request.get("action") == "approve_booking_requests":
                    response = approve_booking_requests(request)

                elif request.get("action") == "approve_check_in_details":
                    response = approve_check_in_details(request)

                elif request.get("action") == "cancel_check_in":
                    response = cancel_check_in(request)

                elif request.get("action") == "approve_check_out_details":
                    response = approve_check_out_details(request)

                # Roomboy functions
                elif request.get("action") == "get_room_details_for_room_boy":
                    response = get_room_details_for_room_boy()

                elif request.get("action") == "check_room":
                    response = check_room(request)


                # SysAdmin functions
                elif request.get("action") == "get_table_details":
                    response = get_table_details(request)

                elif request.get("action") == "get_all_table_names":
                    response = get_all_table_names()

                elif request.get("action") == "insert_into_table":
                    response = insert_into_table(request)

                elif request.get("action") == "delete_from_table":
                    response = delete_from_table(request)

                elif request.get("action") == "update_table":
                    response = update_table(request)

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


# Custom JSON encoder for handling non-serializable types
class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (datetime, date)):
            return obj.isoformat()  # Convert dates to ISO format
        elif isinstance(obj, Decimal):
            return float(obj)  # Convert Decimal to float
        return super().default(obj)


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


# Client Functions
def get_city():
    try:
        # Query the City table to get all cities
        cities = City.query.all()

        # If no cities are found, return an error message
        if not cities:
            return {'status': 'error', 'message': 'No cities found'}

        # Prepare the list of city names to be returned
        city_names = [city.City for city in cities]

        return {'status': 'success', 'cities': city_names}

    except Exception as e:
        return {'status': 'error', 'message': str(e)}


# Manager Functions
def get_booking_request():
    try:
        # Query all bookings
        bookings = Booking.query.all()

        # Prepare the response data
        booking_requests = []

        for booking in bookings:
            # Get the client details
            client = Client.query.filter_by(ClientID=booking.ClientID).first()
            if not client:
                continue  # Skip if client doesn't exist

            # Get the check-in details
            checkin_details = CheckinDetails.query.filter_by(BookingID=booking.BookingID).first()
            payment_status = checkin_details.PaymentStatus if checkin_details else 'N/A'

            # Append the booking details to the response
            booking_requests.append({
                'BookingID': booking.BookingID,
                'Client': {
                    'ClientID': client.ClientID,
                    'FullName': client.FullName,
                    'DateOfBirth': client.DateOfBirth.strftime('%Y-%m-%d') if client.DateOfBirth else 'N/A',
                    'Address': client.Address,
                    'Phone': client.Phone,
                    'PassportSeries': client.PassportSeries,
                    'Email': client.Email,
                    'Username': client.Username
                },
                'HotelID': booking.HotelID,
                'RoomNumber': booking.RoomNumber,
                'AdultsNumber': booking.AdultsNumber,
                'ChildrenNumber': booking.ChildrenNumber,
                'CheckinDate': booking.CheckinDate.strftime('%Y-%m-%d') if booking.CheckinDate else 'N/A',
                'CheckoutDate': booking.CheckoutDate.strftime('%Y-%m-%d') if booking.CheckoutDate else 'N/A',
                'TotalPrice': float(booking.TotalPrice),
                'Duration': float(booking.Duration) if booking.Duration else 0,
                'PaymentStatus': payment_status
            })

        # Return the response in JSON format
        return {'status': 'success', 'booking_requests': booking_requests}

    except Exception as e:
        return {'status': 'error', 'message': str(e)}


def get_booking_request_by_id(data):
    """
    Retrieve booking details by BookingID.

    Parameters:
        data (dict): A dictionary containing the BookingID.

    Returns:
        dict: A response with the status and booking details.
    """
    try:
        # Extract the BookingID from the request data
        booking_id = data.get('BookingID')
        if not booking_id:
            return {'status': 'error', 'message': 'BookingID is required'}

        # Query the booking
        booking = Booking.query.filter_by(BookingID=booking_id).first()
        if not booking:
            return {'status': 'error', 'message': 'Booking not found'}

        # Query the client associated with the booking
        client = Client.query.filter_by(ClientID=booking.ClientID).first()
        if not client:
            return {'status': 'error', 'message': 'Client not found'}

        # Get the check-in details
        checkin_details = CheckinDetails.query.filter_by(BookingID=booking.BookingID).first()
        payment_status = checkin_details.PaymentStatus if checkin_details else 'N/A'

        # Prepare the booking details
        booking_request = {
            'BookingID': booking.BookingID,
            'Client': {
                'ClientID': client.ClientID,
                'FullName': client.FullName,
                'DateOfBirth': client.DateOfBirth.strftime('%Y-%m-%d') if client.DateOfBirth else 'N/A',
                'Address': client.Address,
                'Phone': client.Phone,
                'PassportSeries': client.PassportSeries,
                'Email': client.Email,
                'Username': client.Username
            },
            'HotelID': booking.HotelID,
            'RoomNumber': booking.RoomNumber,
            'AdultsNumber': booking.AdultsNumber,
            'ChildrenNumber': booking.ChildrenNumber,
            'CheckinDate': booking.CheckinDate.strftime('%Y-%m-%d') if booking.CheckinDate else 'N/A',
            'CheckoutDate': booking.CheckoutDate.strftime('%Y-%m-%d') if booking.CheckoutDate else 'N/A',
            'TotalPrice': float(booking.TotalPrice),
            'Duration': float(booking.Duration) if booking.Duration else 0,
            'PaymentStatus': payment_status
        }

        # Return the response in JSON format
        return {'status': 'success', 'booking_request': booking_request}

    except Exception as e:
        return {'status': 'error', 'message': str(e)}


def get_check_in_details():
    """
    Retrieve all check-in details for all check-ins in the database.

    Returns:
        dict: A dictionary containing the status and all check-in details.
    """
    try:
        # Retrieve all check-in details from the CheckinDetails table
        checkin_details_list = CheckinDetails.query.all()
        if not checkin_details_list:
            return {'status': 'error', 'message': 'No check-in details found'}

        all_checkin_details = []

        for checkin_details in checkin_details_list:
            # Retrieve the associated booking
            booking = Booking.query.filter_by(BookingID=checkin_details.BookingID).first()
            if not booking:
                continue  # Skip if no booking is found for the check-in details

            # Retrieve the associated client
            client = Client.query.filter_by(ClientID=booking.ClientID).first()
            if not client:
                continue  # Skip if no client is found for the booking

            # Retrieve payment information
            payment = Payment.query.filter_by(BookingID=booking.BookingID).first()
            amount_paid = payment.Amount if payment else 0

            # Handle None values for duration and TotalPrice
            duration = booking.Duration if booking.Duration is not None else 0
            total_price = booking.TotalPrice if booking.TotalPrice is not None else 0

            # Convert Decimal values to float for JSON serialization
            total_price = float(total_price) if isinstance(total_price, Decimal) else total_price
            amount_paid = float(amount_paid) if isinstance(amount_paid, Decimal) else amount_paid

            # Calculate total cost
            total_cost = total_price

            # Determine the payment status
            payment_status = "Paid" if amount_paid >= total_cost else "30% Paid"

            # Prepare the check-in details for the response
            checkin_info = {
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

                # Cost Details
                'totalCost': total_cost,
                'TotalPrice': amount_paid,

                # Checkin Details
                'CheckinDetailsID': checkin_details.CheckinDetailsID,
            }

            all_checkin_details.append(checkin_info)

        if not all_checkin_details:
            return {'status': 'error', 'message': 'No check-in details found'}

        return {'status': 'success', 'checkin_details': all_checkin_details}

    except Exception as e:
        return {'status': 'error', 'message': f'Unexpected error: {str(e)}'}


def get_check_in_details_by_id(data):
    try:
        # Handle if `data` is a dictionary (JSON-like input)
        if isinstance(data, dict):
            checkin_id = data.get('CheckinDetailsID')
        else:
            checkin_id = data

        # Check if CheckinDetailsID is valid
        if not checkin_id:
            return {'status': 'error', 'message': 'CheckinDetailsID is missing or invalid'}

        # Query the CheckinDetails table to verify if the record exists
        checkin = CheckinDetails.query.filter_by(CheckinDetailsID=checkin_id).first()
        if not checkin:
            return {'status': 'error', 'message': f'Check-in details with ID {checkin_id} not found'}

        # Query the Booking table to get the associated booking information
        booking = Booking.query.filter_by(BookingID=checkin.BookingID).first()
        if not booking:
            return {'status': 'error', 'message': f'Booking not found for CheckinDetailsID {checkin_id}'}

        # Query the Client table to get client information
        client = Client.query.filter_by(ClientID=booking.ClientID).first()
        if not client:
            return {'status': 'error', 'message': f'Client not found for BookingID {booking.BookingID}'}

        # Query the Payment table to get payment information for the booking
        payment = Payment.query.filter_by(BookingID=booking.BookingID).first()
        amount_paid = float(payment.Amount) if payment and isinstance(payment.Amount, Decimal) else float(0)

        # Calculate duration, total cost, and handle None values
        duration = booking.Duration if booking.Duration is not None else 0
        total_price = booking.TotalPrice if booking.TotalPrice is not None else Decimal(0)
        total_cost = float(total_price)  # Convert Decimal to float

        # Prepare the full check-in details to be returned
        check_in_details = {
            # Client Details
            'ClientID': client.ClientID,
            'ClientName': client.FullName,
            'Phone': client.Phone,

            # Booking Details
            'CheckinDate': booking.CheckinDate.strftime('%Y-%m-%d') if booking.CheckinDate else 'N/A',
            'CheckoutDate': booking.CheckoutDate.strftime('%Y-%m-%d') if booking.CheckoutDate else 'N/A',
            'Duration': duration,
            'AdultsNumber': booking.AdultsNumber if booking.AdultsNumber is not None else 0,
            'ChildrenNumber': booking.ChildrenNumber if booking.ChildrenNumber is not None else 0,
            'RoomNumber': booking.RoomNumber if booking.RoomNumber is not None else 'N/A',

            # Cost Details
            'TotalCost': total_cost,
            'AmountPaid': amount_paid,

            # Check-in Details
            'CheckinDetailsID': checkin.CheckinDetailsID,
            'PaymentStatus': checkin.PaymentStatus if checkin.PaymentStatus else 'N/A'
        }

        return {'status': 'success', 'check_in_details': check_in_details}

    except Exception as e:
        return {'status': 'error', 'message': f'Unexpected error: {str(e)}'}


def get_check_out_details():
    """
    Retrieve all checkout details for all check-outs in the database.

    Returns:
        dict: A dictionary containing the status and all checkout details.
    """
    try:
        # Retrieve all checkout details from the CheckoutDetails table
        checkout_details_list = CheckoutDetails.query.all()
        if not checkout_details_list:
            return {'status': 'error', 'message': 'No checkout details found'}

        all_checkout_details = []

        for checkout_details in checkout_details_list:
            # Retrieve the associated booking
            booking = Booking.query.filter_by(BookingID=checkout_details.BookingID).first()
            if not booking:
                continue  # Skip if no booking is found for the checkout details

            # Retrieve the associated client
            client = Client.query.filter_by(ClientID=booking.ClientID).first()
            if not client:
                continue  # Skip if no client is found for the booking

            # Retrieve payment information
            payment = Payment.query.filter_by(BookingID=booking.BookingID).first()
            amount_paid = payment.Amount if payment else 0

            # Handle None values for duration and TotalPrice
            duration = booking.Duration if booking.Duration is not None else 0
            total_price = booking.TotalPrice if booking.TotalPrice is not None else 0

            # Convert Decimal values to float for JSON serialization
            total_price = float(total_price) if isinstance(total_price, Decimal) else total_price
            amount_paid = float(amount_paid) if isinstance(amount_paid, Decimal) else amount_paid

            # Calculate total cost
            total_cost = total_price

            # Determine the payment status
            payment_status = "Paid" if amount_paid >= total_cost else "30% Paid"

            # Prepare the checkout details for the response
            checkout_info = {
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

                # Cost Details
                'totalCost': float(total_cost) if isinstance(total_cost, Decimal) else total_cost,
                'TotalPrice': float(amount_paid) if isinstance(amount_paid, Decimal) else amount_paid,

                # Checkout Details
                'CheckoutDetailsID': checkout_details.CheckoutDetailsID,
                'MissingEquipment': checkout_details.MissingEquipment if checkout_details.MissingEquipment else 'N/A',
                'BrokenEquipment': checkout_details.BrokenEquipment if checkout_details.BrokenEquipment else 'N/A',
                'RestaurantFee': float(checkout_details.RestaurantFee) if isinstance(checkout_details.RestaurantFee,
                                                                                     Decimal) else checkout_details.RestaurantFee if checkout_details.RestaurantFee is not None else 0,
                'BarFee': float(checkout_details.BarFee) if isinstance(checkout_details.BarFee,
                                                                       Decimal) else checkout_details.BarFee if checkout_details.BarFee is not None else 0,
                'AdditionalFee': float(checkout_details.AdditionalFee) if isinstance(checkout_details.AdditionalFee,
                                                                                     Decimal) else checkout_details.AdditionalFee if checkout_details.AdditionalFee is not None else 0,
                'RoomServiceFee': float(checkout_details.RoomServiceFee) if isinstance(checkout_details.RoomServiceFee,
                                                                                       Decimal) else checkout_details.RoomServiceFee if checkout_details.RoomServiceFee is not None else 0,
                'CheckStatus': checkout_details.CheckStatus if checkout_details.CheckStatus else 'N/A',
                'CheckoutTotalPrice': float(checkout_details.TotalPrice) if isinstance(checkout_details.TotalPrice,
                                                                                       Decimal) else checkout_details.TotalPrice if checkout_details.TotalPrice is not None else 0
            }

            all_checkout_details.append(checkout_info)

        if not all_checkout_details:
            return {'status': 'error', 'message': 'No checkout details found'}

        return {'status': 'success', 'checkout_details': all_checkout_details}

    except Exception as e:
        return {'status': 'error', 'message': f'Unexpected error: {str(e)}'}


def get_check_out_details_by_id(data):
    try:
        # Handle if `data` is a dictionary (JSON-like input)
        if isinstance(data, dict):
            checkout_id = data.get('CheckoutDetailsID')
        else:
            checkout_id = data

        # Check if CheckoutDetailsID is valid
        if not checkout_id:
            return {'status': 'error', 'message': 'CheckoutDetailsID is missing or invalid'}

        # Query the CheckoutDetails table to verify if the record exists
        checkout = CheckoutDetails.query.filter_by(CheckoutDetailsID=checkout_id).first()
        if not checkout:
            return {'status': 'error', 'message': f'Checkout details with ID {checkout_id} not found'}

        # Query the Booking table to get the associated booking information
        booking = Booking.query.filter_by(BookingID=checkout.BookingID).first()
        if not booking:
            return {'status': 'error', 'message': f'Booking not found for CheckoutDetailsID {checkout_id}'}

        # Query the Client table to get client information
        client = Client.query.filter_by(ClientID=booking.ClientID).first()
        if not client:
            return {'status': 'error', 'message': f'Client not found for BookingID {booking.BookingID}'}

        # Query the Payment table to get payment information for the booking
        payment = Payment.query.filter_by(BookingID=booking.BookingID).first()
        amount_paid = float(payment.Amount) if payment and isinstance(payment.Amount, Decimal) else float(0)

        # Calculate duration, total cost, and handle None values
        duration = booking.Duration if booking.Duration is not None else 0
        total_price = booking.TotalPrice if booking.TotalPrice is not None else Decimal(0)
        total_cost = float(total_price)  # Convert Decimal to float

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
            'Duration': duration,
            'AdultsNumber': booking.AdultsNumber if booking.AdultsNumber is not None else 0,
            'ChildrenNumber': booking.ChildrenNumber if booking.ChildrenNumber is not None else 0,
            'RoomNumber': booking.RoomNumber if booking.RoomNumber is not None else 'N/A',

            # Cost Details
            'TotalCost': total_cost,
            'AmountPaid': amount_paid,

            # Checkout Details
            'CheckoutDetailsID': checkout.CheckoutDetailsID,
            'MissingEquipment': checkout.MissingEquipment if checkout.MissingEquipment else 'N/A',
            'BrokenEquipment': checkout.BrokenEquipment if checkout.BrokenEquipment else 'N/A',
            'RestaurantFee': float(checkout.RestaurantFee) if isinstance(checkout.RestaurantFee,
                                                                         Decimal) else checkout.RestaurantFee,
            'BarFee': float(checkout.BarFee) if isinstance(checkout.BarFee, Decimal) else checkout.BarFee,
            'AdditionalFee': float(checkout.AdditionalFee) if isinstance(checkout.AdditionalFee,
                                                                         Decimal) else checkout.AdditionalFee,
            'RoomServiceFee': float(checkout.RoomServiceFee) if isinstance(checkout.RoomServiceFee,
                                                                           Decimal) else checkout.RoomServiceFee,
            'CheckStatus': checkout.CheckStatus if checkout.CheckStatus else 'N/A',
            'CheckoutTotalPrice': float(checkout.TotalPrice) if isinstance(checkout.TotalPrice,
                                                                           Decimal) else checkout.TotalPrice
        }

        return {'status': 'success', 'checkout_details': checkout_details}

    except Exception as e:
        return {'status': 'error', 'message': f'Unexpected error: {str(e)}'}


def approve_check_in_details(data):
    """
    Approves a check-in for a given CheckinDetailsID and updates the PaymentStatus to 'Paid'.

    Parameters:
        data (dict): A dictionary containing the CheckinDetailsID.

    Returns:
        dict: A response with the status of the operation.
    """
    # Extract the CheckinDetailsID from the data
    checkin_details_id = data.get('CheckinDetailsID')
    if not checkin_details_id:
        return {'status': 'error', 'message': 'Missing CheckinDetailsID'}

    try:
        # Retrieve the check-in details associated with the CheckinDetailsID
        checkin_details = CheckinDetails.query.filter_by(CheckinDetailsID=checkin_details_id).first()
        if not checkin_details:
            return {'status': 'error', 'message': 'CheckinDetails not found for the given CheckinDetailsID'}

        # Retrieve the booking associated with this check-in details
        booking = Booking.query.filter_by(BookingID=checkin_details.BookingID).first()
        if not booking:
            return {'status': 'error', 'message': 'Booking not found for the given CheckinDetailsID'}

        # Retrieve the room associated with this booking
        room = Room.query.filter_by(RoomNumber=booking.RoomNumber, HotelID=booking.HotelID).first()
        if not room:
            return {'status': 'error', 'message': 'Room not found'}

        # Update the PaymentStatus to 'Paid'
        checkin_details.PaymentStatus = 'Paid'
        db.session.commit()

        return {'status': 'success',
                'message': f'PaymentStatus for CheckinDetailsID {checkin_details_id} has been updated to "Paid"'}
    except Exception as e:
        return {'status': 'error', 'message': str(e)}


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
        room.Status = 'Booked'
        db.session.commit()

        return {'status': 'success', 'message': f'Room {room.RoomNumber} has been successfully booked'}
    except Exception as e:
        return {'status': 'error', 'message': str(e)}


def approve_check_out_details(data):
    # Extract the CheckoutDetailsID from the request data
    checkout_details_id = data.get('CheckoutDetailsID')
    if not checkout_details_id:
        return {'status': 'error', 'message': 'Missing CheckoutDetailsID'}

    try:
        # Retrieve the checkout details associated with the CheckoutDetailsID
        checkout_details = CheckoutDetails.query.filter_by(CheckoutDetailsID=checkout_details_id).first()
        if not checkout_details:
            return {'status': 'error', 'message': 'CheckoutDetails not found for the given CheckoutDetailsID'}

        # Retrieve the booking details associated with the BookingID from CheckoutDetails
        booking = Booking.query.filter_by(BookingID=checkout_details.BookingID).first()
        if not booking:
            return {'status': 'error', 'message': 'Booking not found for the given CheckoutDetailsID'}

        # Retrieve the Room associated with this booking
        room = Room.query.filter_by(RoomNumber=booking.RoomNumber, HotelID=booking.HotelID).first()
        if not room:
            return {'status': 'error', 'message': 'Room not found'}

        # Check if the room is currently booked, if not return an error
        if room.Status != 'booked':
            return {'status': 'error', 'message': f'Room {room.RoomNumber} is not currently marked as booked'}

        # Update the room's status from 'booked' to 'available'
        room.Status = 'Available'
        db.session.commit()

        return {'status': 'success',
                'message': f'Room {room.RoomNumber} has been successfully marked as available for CheckoutDetailsID {checkout_details_id}'}
    except Exception as e:
        return {'status': 'error', 'message': str(e)}


def cancel_check_in(request):
    # Extract the CheckinDetailsID from the request dictionary
    checkin_details_id = request.get('CheckinDetailsID')

    if not checkin_details_id:
        return {'status': 'error', 'message': 'Missing CheckinDetailsID'}

    try:
        # Retrieve the CheckinDetails associated with the provided CheckinDetailsID
        checkin_details = CheckinDetails.query.filter_by(CheckinDetailsID=checkin_details_id).first()

        if not checkin_details:
            return {'status': 'error', 'message': f'CheckinDetails with ID {checkin_details_id} not found'}

        # Retrieve the booking associated with the CheckinDetails
        booking = Booking.query.filter_by(BookingID=checkin_details.BookingID).first()

        if not booking:
            return {'status': 'error', 'message': f'Booking for CheckinDetailsID {checkin_details_id} not found'}

        # Retrieve the room associated with this booking
        room = Room.query.filter_by(RoomNumber=booking.RoomNumber, HotelID=booking.HotelID).first()

        if not room:
            return {'status': 'error', 'message': f'Room with RoomNumber {booking.RoomNumber} not found'}

        # Check if the room is currently booked
        if room.Status != 'Booked':
            return {'status': 'error', 'message': f'Room {room.RoomNumber} is not currently booked'}

        # Update the room status to "free"
        room.Status = 'Available'

        # Save the room changes
        db.session.commit()

        return {'status': 'success',
                'message': f'Check-in for CheckinDetailsID {checkin_details_id} successfully canceled, Room {room.RoomNumber} is now available'}

    except Exception as e:
        db.session.rollback()  # Roll back the transaction if there is an error
        return {'status': 'error', 'message': f'Unexpected error: {str(e)}'}

#Roomboy Functions
def get_room_details_for_room_boy():
    try:
        # Perform a join query to get the required details
        room_details = (
            db.session.query(
                Room.RoomNumber,
                RoomType.Name.label('RoomTypeName'),
                Booking.CheckoutDate,
                Hotel.CheckOutTime,
                CheckoutDetails.CheckStatus
            )
            .join(Booking, Room.RoomNumber == Booking.RoomNumber)
            .join(Hotel, Room.HotelID == Hotel.HotelID)
            .join(RoomType, Room.TypeID == RoomType.TypeID)
            .join(CheckoutDetails, Booking.BookingID == CheckoutDetails.BookingID)
            .filter(CheckoutDetails.CheckStatus.isnot(None))  # Include only rows with a CheckStatus
            .all()
        )

        # Prepare the data in a dictionary format
        room_details_list = [
            {
                'RoomNumber': detail.RoomNumber,
                'RoomType': detail.RoomTypeName,
                'CheckoutDate': detail.CheckoutDate.strftime('%Y-%m-%d') if detail.CheckoutDate else 'N/A',
                'CheckOutTime': detail.CheckOutTime.strftime('%H:%M:%S') if detail.CheckOutTime else 'N/A',
                'CheckStatus': detail.CheckStatus,
            }
            for detail in room_details
        ]

        return {'status': 'success', 'room_details': room_details_list}
    except Exception as e:
        return {'status': 'error', 'message': f'Unexpected error: {str(e)}'}

def check_room(data):
    # Extract the CheckoutDetailsID and validate it
    checkout_details_id = data.get('CheckoutDetailsID')
    if not checkout_details_id:
        return {'status': 'error', 'message': 'Missing CheckoutDetailsID'}

    try:
        # Retrieve the checkout details record
        checkout_details = CheckoutDetails.query.filter_by(CheckoutDetailsID=checkout_details_id).first()
        if not checkout_details:
            return {'status': 'error', 'message': 'CheckoutDetails not found'}

        # Update the fees and equipment details
        checkout_details.RestaurantFee = data.get('RestaurantFee', checkout_details.RestaurantFee)
        checkout_details.BarFee = data.get('BarFee', checkout_details.BarFee)
        checkout_details.RoomServiceFee = data.get('RoomServiceFee', checkout_details.RoomServiceFee)
        checkout_details.MissingEquipment = data.get('MissingEquipment', checkout_details.MissingEquipment)
        checkout_details.BrokenEquipment = data.get('BrokenEquipment', checkout_details.BrokenEquipment)
        checkout_details.AdditionalFee = data.get('AdditionalFee', checkout_details.AdditionalFee)

        # Update the CheckStatus to "checked"
        checkout_details.CheckStatus = 'checked'

        # Commit the changes to the database
        db.session.commit()

        return {'status': 'success', 'message': 'Room check successfully updated'}
    except Exception as e:
        # Rollback the session in case of an error
        db.session.rollback()
        return {'status': 'error', 'message': f'Unexpected error: {str(e)}'}


# SysAdmin functions
def get_hotels(city):
    try:
        # Query the Hotel table to find hotels in the specified city
        hotels = Hotel.query.filter_by(City=city).all()

        # If no hotels are found for the city, return an error message
        if not hotels:
            return {'status': 'error', 'message': f'No hotels found in {city}'}

        # Prepare the list of hotel names to be returned
        hotel_list = [{
            'hotel_name': hotel.Name,
            'hotel_id': hotel.HotelID,
            'city': hotel.CityName,
            'address': hotel.Address,
            'rating': hotel.Rating
        } for hotel in hotels]

        return {'status': 'success', 'hotels': hotel_list}

    except Exception as e:
        return {'status': 'error', 'message': str(e)}


def get_all_table_names():
    try:
        # Use SQLAlchemy's inspector to get table names
        inspector = inspect(db.engine)
        table_names = inspector.get_table_names()
        return {"status": "success", "table_names": table_names}
    except Exception as e:
        return {"status": "error", "message": str(e)}


def get_table_details(json_request):
    try:
        # Extract table name from the JSON request
        table_name = json_request.get("table_name")
        if not table_name:
            return {"status": "error", "message": "Missing 'table_name' in request"}

        # Dynamically construct the query to fetch all rows
        query = text(f"SELECT * FROM {table_name}")

        # Execute the query
        result = db.session.execute(query)

        # Fetch column names
        columns = result.keys()

        # Fetch all rows and convert them into a list of dictionaries
        rows = [dict(zip(columns, row)) for row in result.fetchall()]

        # Convert data to JSON-compatible format
        json_data = json.loads(json.dumps(rows, cls=CustomJSONEncoder))

        return {"status": "success", "data": json_data}
    except Exception as e:
        return {"status": "error", "message": str(e)}


def insert_into_table(json_request):
    try:
        # Extract table name and data from the JSON request
        table_name = json_request.get("table_name")
        data = json_request.get("data")  # Dictionary of column-value pairs

        if not table_name:
            return {"status": "error", "message": "Missing 'table_name' in request"}

        if not data or not isinstance(data, dict):
            return {"status": "error", "message": "Invalid or missing 'data' in request"}

        # Dynamically construct the query to insert data
        columns = ", ".join(data.keys())
        values_placeholders = ", ".join([f":{key}" for key in data.keys()])

        query = text(f"INSERT INTO {table_name} ({columns}) VALUES ({values_placeholders})")

        # Execute the query
        db.session.execute(query, data)
        db.session.commit()

        return {"status": "success", "message": "Data inserted successfully"}
    except Exception as e:
        db.session.rollback()
        return {"status": "error", "message": str(e)}


def delete_from_table(json_request):
    try:
        # Extract table name and conditions from the JSON request
        table_name = json_request.get("table_name")
        conditions = json_request.get("conditions")  # Dictionary of column-value pairs for WHERE clause

        if not table_name:
            return {"status": "error", "message": "Missing 'table_name' in request"}

        if not conditions or not isinstance(conditions, dict):
            return {"status": "error", "message": "Invalid or missing 'conditions' in request"}

        # Dynamically construct the WHERE clause
        where_clause = " AND ".join([f"{key} = :{key}" for key in conditions.keys()])

        # Get dependent tables and their foreign keys
        query = text(f"""
            SELECT TABLE_NAME, COLUMN_NAME, REFERENCED_COLUMN_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE REFERENCED_TABLE_NAME = :table_name
        """)
        result = db.session.execute(query, {"table_name": table_name})
        dependent_tables = result.mappings().all()  # Converts result to list of dictionaries

        # Delete from dependent tables first
        for dep_table in dependent_tables:
            dep_table_name = dep_table["TABLE_NAME"]
            dep_column_name = dep_table["COLUMN_NAME"]
            referenced_column_name = dep_table["REFERENCED_COLUMN_NAME"]

            # Construct delete query for dependent table
            dep_query = text(f"""
                DELETE FROM {dep_table_name}
                WHERE {dep_column_name} IN (
                    SELECT {referenced_column_name}
                    FROM {table_name}
                    WHERE {where_clause}
                )
            """)
            db.session.execute(dep_query, conditions)

        # Delete rows from the main table
        delete_query = text(f"DELETE FROM {table_name} WHERE {where_clause}")
        db.session.execute(delete_query, conditions)
        db.session.commit()

        return {"status": "success", "message": "Row(s) deleted successfully, including dependencies"}
    except Exception as e:
        db.session.rollback()
        return {"status": "error", "message": str(e)}


def update_table(json_request):
    try:
        # Extract table name, data to update, and conditions from the JSON request
        table_name = json_request.get("table_name")
        data = json_request.get("data")  # Dictionary of columns and new values
        conditions = json_request.get("conditions")  # Dictionary of column-value pairs for WHERE clause

        if not table_name:
            return {"status": "error", "message": "Missing 'table_name' in request"}

        if not data or not isinstance(data, dict):
            return {"status": "error", "message": "Invalid or missing 'data' in request"}

        if not conditions or not isinstance(conditions, dict):
            return {"status": "error", "message": "Invalid or missing 'conditions' in request"}

        # Dynamically construct the SET clause
        set_clause = ", ".join([f"{key} = :{key}" for key in data.keys()])

        # Dynamically construct the WHERE clause
        where_clause = " AND ".join([f"{key} = :{key}" for key in conditions.keys()])

        # Combine data and conditions into a single dictionary for parameter binding
        parameters = {**data, **conditions}

        # Construct the UPDATE query
        query = text(f"UPDATE {table_name} SET {set_clause} WHERE {where_clause}")

        # Execute the query
        db.session.execute(query, parameters)
        db.session.commit()

        return {"status": "success", "message": "Row(s) updated successfully"}
    except Exception as e:
        db.session.rollback()
        return {"status": "error", "message": str(e)}


if __name__ == '__main__':
    threading.Thread(target=start_tcp_server).start()
    app.run(host='0.0.0.0', port=9999, debug=True)
