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
# Custom JSON encoder for handling non-serializable types
class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (datetime, date)):
            return obj.isoformat()  # Convert dates to ISO format
        elif isinstance(obj, Decimal):
            return float(obj)  # Convert Decimal to float
        return super().default(obj)



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
                elif request.get("action") == "get_hotel_by_city":
                    response = get_hotel_by_city(request)

                elif request.get("action") == "get_hotel_data":
                    response = get_hotel_data(request)

                elif request.get("action") == "booking":
                    response = booking(request)

                elif request.get("action") == "payment":
                    response = payment(request)




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


                # Assistant functions
                elif request.get("action") == "update_rooms_list":
                    response = update_rooms_list(request)

                elif request.get("action") == "delete_room":
                    response = delete_room(request)

                elif request.get("action") == "get_rooms_list":
                    response = get_rooms_list()

                elif request.get("action") == "add_new_room":
                    response = add_new_room(request)

                elif request.get("action") == "get_room_types_info":
                    response = get_room_types_info()

                elif request.get("action") == "add_room_type":
                    response = add_room_type(request)

                elif request.get("action") == "update_basic_info":
                    response = update_basic_info(request)

                elif request.get("action") == "get_basic_information":
                    response = get_basic_information()

                elif request.get("action") == "update_room_type":
                    response = update_room_type()


                # Roomboy functions
                elif request.get("action") == "get_room_details_for_room_boy":
                    response = get_room_details_for_room_boy()
                elif request.get("action") == "update_checkout_details":
                    response = update_checkout_details(request)


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
            random_client_id = random.randint(100000, 999999)
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

def get_hotel_by_city(data):
    # Define the fields that are valid for this operation
    valid_fields = ['city']

    # Filter the data to include only valid fields
    filtered_data = {key: data[key] for key in valid_fields if key in data}

    # Check if the required field 'city' is provided
    if 'city' not in filtered_data or not filtered_data['city']:
        return {'status': 'error', 'message': 'Missing or empty city name'}

    try:
        # Perform a case-insensitive search for hotels in the specified city
        city = filtered_data['city']
        hotels = Hotel.query.filter(Hotel.City.ilike(f"%{city}%")).limit(10).all()  # Limit results to 10

        if not hotels:
            return {'status': 'error', 'message': 'No hotels found in the specified city'}

        # Prepare the response with essential fields
        result = []
        for hotel in hotels:
            hotel_data = {
                'HotelID': hotel.HotelID,
                'Name': hotel.Name[:50],  # Truncate Name to 50 characters
                'City': hotel.City,
                'Stars': hotel.Stars,
                'Address': hotel.Address
            }
            result.append(hotel_data)

        return {'status': 'success', 'hotels': result}
    except Exception as e:
        return {'status': 'error', 'message': str(e)}

def get_hotel_data(data):
    # Define the fields that are valid for this operation
    valid_fields = ['HotelID']

    # Filter the data to include only valid fields
    filtered_data = {key: data[key] for key in valid_fields if key in data}

    # Check if the required field 'HotelID' is provided
    if 'HotelID' not in filtered_data or not filtered_data['HotelID']:
        return {'status': 'error', 'message': 'Missing or empty HotelID'}

    try:
        # Fetch hotel data by HotelID
        hotel = Hotel.query.filter_by(HotelID=filtered_data['HotelID']).first()
        if not hotel:
            return {'status': 'error', 'message': 'Hotel not found'}

        # Fetch all room types for the given HotelID
        room_types = RoomType.query.filter_by(HotelID=filtered_data['HotelID']).all()

        # Prepare the response data
        hotel_data = {
            'HotelID': hotel.HotelID,
            'Name': hotel.Name,
            'City': hotel.City,
            'Address': hotel.Address,
            'Phone': hotel.Phone,
            'Email': hotel.Email,
            'Stars': hotel.Stars,
            'Facilities': hotel.Facilities,
            'CheckInTime': hotel.CheckInTime,
            'CheckOutTime': hotel.CheckOutTime,
            'Description': hotel.Description,
        }

        room_type_data = [
            {
                'TypeID': room.TypeID,
                'Name': room.Name,
                'Description': room.Description,
                'Facility': room.Facility,
                'PriceAdults': float(room.PriceAdults),  # Convert Decimal to float
                'PriceChildren': float(room.PriceChildren),  # Convert Decimal to float
                'PriceBabies': float(room.PriceBabies),  # Convert Decimal to float
                'Capacity': room.Capacity,
            }
            for room in room_types
        ]

        return {'status': 'success', 'hotel': hotel_data, 'room_types': room_type_data}
    except Exception as e:
        return {'status': 'error', 'message': str(e)}

def booking(data):
    # Define the fields that are valid for this operation
    valid_fields = ['ClientID', 'HotelID', 'CheckinDate', 'CheckoutDate', 'AdultsNumber', 'ChildrenNumber', 'RoomType']

    # Filter the data to include only valid fields
    filtered_data = {key: data[key] for key in valid_fields if key in data}

    # Check if all required fields are provided
    if not all(field in filtered_data for field in valid_fields):
        return {'status': 'error', 'message': 'Missing required fields'}

    try:
        # Step 0: Check for available rooms
        hotel_id = filtered_data['HotelID']
        room_type = filtered_data['RoomType']
        available_room = Room.query.filter_by(HotelID=hotel_id, TypeID=room_type, Status='Available').first()

        if not available_room:
            return {'status': 'error', 'message': 'No available rooms for the selected room type'}

        room_number = available_room.RoomNumber

        # Step 1: Check if the number of guests fits the room's capacity
        adults = filtered_data['AdultsNumber']
        children = filtered_data['ChildrenNumber']
        checkin_date = datetime.strptime(filtered_data['CheckinDate'], '%Y-%m-%d')
        checkout_date = datetime.strptime(filtered_data['CheckoutDate'], '%Y-%m-%d')
        duration = (checkout_date - checkin_date).days
        room_capacity = RoomType.query.filter_by(TypeID=room_type, HotelID=hotel_id).first().Capacity

        if not room_capacity:
            return {'status': 'error', 'message': 'Invalid room type or capacity'}

        if room_capacity < (float(adults) + 0.5 * float(children)):
            return {'status': 'error', 'message': 'Too many guests for this room'}

        # Step 2: Calculate TotalPrice
        room_details = RoomType.query.filter_by(TypeID=room_type, HotelID=hotel_id).first()
        price_adults = room_details.PriceAdults
        price_children = room_details.PriceChildren
        total_price = duration*(price_adults * adults + price_children * children)

        # Step 3: Calculate the duration of stay


        if duration <= 0:
            return {'status': 'error', 'message': 'Invalid check-in and check-out dates'}

        # Step 4: Add the booking to the database
        # Generate a unique BookingID
        while True:
            booking_id = random.randint(10000, 99999)
            existing_booking = Booking.query.filter_by(BookingID=booking_id).first()
            if not existing_booking:
                break

        # Create a new booking record
        new_booking = Booking(
            BookingID=booking_id,
            ClientID=filtered_data['ClientID'],
            HotelID=hotel_id,
            RoomNumber=room_number,
            AdultsNumber=adults,
            ChildrenNumber=children,
            CheckinDate=checkin_date,
            CheckoutDate=checkout_date,
            Duration=duration,
            TotalPrice=total_price
        )
        db.session.add(new_booking)

        # Update room status to "Booked"
        available_room.Status = 'Booked'
        db.session.commit()

        # Step 5: Return booking details
        return {
            'status': 'success',
            'BookingID': booking_id,
            'Duration': duration,
            'TotalPrice': float(total_price),
            'CheckinDate': checkin_date.strftime('%Y-%m-%d'),
            'CheckoutDate': checkout_date.strftime('%Y-%m-%d')
        }
    except Exception as e:
        return {'status': 'error', 'message': str(e)}

def payment(data):
    # Define the fields that are valid for this operation
    valid_fields = ['BookingID', 'PaymentMethod', 'Amount']

    # Filter the data to include only valid fields
    filtered_data = {key: data[key] for key in valid_fields if key in data}

    # Check if all required fields are provided
    if not all(field in filtered_data for field in valid_fields):
        return {'status': 'error', 'message': 'Missing required fields'}

    try:
        # Check if the BookingID exists in the Booking table
        booking = Booking.query.filter_by(BookingID=filtered_data['BookingID']).first()
        if not booking:
            return {'status': 'error', 'message': 'Invalid BookingID'}

        # Fetch the TotalPrice from the booking
        total_price = float(booking.TotalPrice)

        # Verify the payment amount based on the PaymentMethod
        payment_method = filtered_data['PaymentMethod']
        amount = float(filtered_data['Amount'])

        if payment_method == 'pay full price':
            if amount != total_price:
                return {'status': 'error', 'message': 'Payment amount does not match full price'}
        elif payment_method == 'pay 30%':
            expected_amount = round(total_price * 0.3, 2)  # Calculate 30% of the total price
            if amount != expected_amount:
                return {'status': 'error', 'message': f'Payment amount must be 30% of total price: {expected_amount}'}
        else:
            return {'status': 'error', 'message': 'Invalid payment method'}

        # Generate a unique PaymentID
        while True:
            payment_id = random.randint(10000, 99999)
            existing_payment = Payment.query.filter_by(PaymentID=payment_id).first()
            if not existing_payment:
                break

        # Add the payment to the Payment table
        new_payment = Payment(
            PaymentID=payment_id,
            BookingID=filtered_data['BookingID'],
            Amount=amount,
            PaymentDate=datetime.now().date(),
            PaymentMethod=payment_method
        )
        db.session.add(new_payment)
        db.session.commit()

        # Return success status
        return {
            'status': 'success',
            'message': 'Payment completed successfully',
            'PaymentID': payment_id,
            'BookingID': filtered_data['BookingID'],
            'Amount': amount,
            'PaymentDate': datetime.now().date().strftime('%Y-%m-%d'),
            'PaymentMethod': payment_method
        }
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

        # Retrieve the RoomType using Room's TypeID
        room_type = RoomType.query.filter_by(TypeID=room.TypeID, HotelID=booking.HotelID).first()
        if not room_type:
            return {'status': 'error', 'message': 'Room Type not found'}

        # Retrieve the PaymentMethod from the Payment table based on BookingID
        payment = Payment.query.filter_by(BookingID=booking.BookingID).first()
        if not payment:
            return {'status': 'error', 'message': 'Payment information not found'}

        while True:
            id = random.randint(10000, 99999)
            existing_booking = CheckoutDetails.query.filter_by(CheckoutDetailsID=id).first()
            if not existing_booking:
                break

        # Insert entry into checkindetails table with PaymentStatus from PaymentMethod
        checkin_detail = CheckinDetails(
            ClientID=booking.ClientID,
            BookingID=booking.BookingID,
            TypeID=room_type.TypeID,  # From RoomType
            Rooms=1,  # Assuming 1 room per booking, adjust if needed
            PaymentStatus=payment.PaymentMethod  # Set PaymentStatus based on PaymentMethod
        )
        db.session.add(checkin_detail)

        # Insert entry into checkoutdetails table
        checkout_detail = CheckoutDetails(
            CheckoutDetailsID=id,
            BookingID=booking.BookingID,
            RoomNumber=booking.RoomNumber
        )
        db.session.add(checkout_detail)

        # Commit the changes to the database
        db.session.commit()

        return {'status': 'success', 'message': f'Booking {booking.BookingID} has been successfully processed'}

    except Exception as e:
        db.session.rollback()  # Rollback in case of an error
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

# Assistant functions
def get_basic_information():
    """
    Retrieves basic information about the hotel, including description, address, phone number,
    stars, facilities, check-in time, and check-out time.

    Returns:
        dict: A dictionary containing the status and hotel information.
    """
    try:
        # Query the Hotel table to get the required fields
        hotel_info = db.session.query(
            Hotel.Description,
            Hotel.Address,
            Hotel.Phone,
            Hotel.Stars,
            Hotel.Facilities,
            Hotel.CheckInTime,
            Hotel.CheckOutTime
        ).first()  # Assuming there's only one hotel entry, if more, you need to handle that

        # Check if hotel information is found
        if hotel_info:
            # Format and return the data
            return {
                'status': 'success',
                'hotel_info': {
                    'Hotel Description': hotel_info.Description if hotel_info.Description else 'N/A',
                    'Address': hotel_info.Address if hotel_info.Address else 'N/A',
                    'Phone': hotel_info.Phone if hotel_info.Phone else 'N/A',
                    'Stars': hotel_info.Stars if hotel_info.Stars else 'N/A',
                    'Facility': hotel_info.Facilities if hotel_info.Facilities else 'N/A',
                    'Check In Time': hotel_info.CheckInTime if hotel_info.CheckInTime else 'N/A',
                    'Check Out Time': hotel_info.CheckOutTime if hotel_info.CheckOutTime else 'N/A'
                }
            }
        else:
            return {'status': 'error', 'message': 'Hotel information not found'}
    except Exception as e:
        return {'status': 'error', 'message': f'Unexpected error: {str(e)}'}

def update_basic_info(data):
    """
    Updates the details of a room type in the RoomType table.

    Parameters:
        data (dict): A dictionary containing the TypeID and new values for the room type fields.
        Expected keys:
            - TypeID: ID of the room type to update
            - Description: New description for the room type
            - Facility: New facility information for the room type
            - PriceAdults: New price for adults in the room type
            - PriceChildren: New price for children in the room type
            - PriceBabies: New price for babies in the room type
            - Capacity: New capacity for the room type

    Returns:
        dict: A dictionary containing the status of the operation.
    """
    # Extract data from the input dictionary
    type_id = data.get('TypeID')
    description = data.get('Description')
    facility = data.get('Facility')
    price_adults = data.get('PriceAdults')
    price_children = data.get('PriceChildren')
    price_babies = data.get('PriceBabies')
    capacity = data.get('Capacity')

    if not type_id:
        return {'status': 'error', 'message': 'Missing TypeID'}

    try:
        # Retrieve the RoomType object based on TypeID
        room_type = RoomType.query.filter_by(TypeID=type_id).first()
        if not room_type:
            return {'status': 'error', 'message': 'RoomType not found'}

        # Update the fields with new values
        if description is not None:
            room_type.Description = description
        if facility is not None:
            room_type.Facility = facility
        if price_adults is not None:
            room_type.PriceAdults = price_adults
        if price_children is not None:
            room_type.PriceChildren = price_children
        if price_babies is not None:
            room_type.PriceBabies = price_babies
        if capacity is not None:
            room_type.Capacity = capacity

        # Commit the changes to the database
        db.session.commit()

        return {'status': 'success', 'message': f'RoomType with ID {type_id} updated successfully'}

    except Exception as e:
        # In case of an error, rollback the transaction
        db.session.rollback()
        return {'status': 'error', 'message': f'Unexpected error: {str(e)}'}

def add_room_type(data):
    """
    Inserts a new room type into the RoomType table.

    Parameters:
        data (dict): A dictionary containing HotelID, Name, Description, Facility,
                     PriceAdults, PriceChildren, PriceBaby, and Capacity.

    Returns:
        dict: A dictionary with the status of the operation.
    """
    try:
        # Extract required fields from the input dictionary
        hotel_id = data.get('HotelID')
        name = data.get('Name')
        description = data.get('Description', '')
        facility = data.get('Facility', '')
        price_adults = data.get('PriceAdults')
        price_children = data.get('PriceChildren')
        price_baby = data.get('PriceBaby')
        capacity = data.get('Capacity')

        # Validate mandatory fields
        if not hotel_id or not name or not price_adults or not price_children or not price_baby or not capacity:
            return {'status': 'error', 'message': 'Missing required fields'}

        # Create a new RoomType instance
        new_room_type = RoomType(
            HotelID=hotel_id,
            Name=name,
            Description=description,
            Facility=facility,
            PriceAdults=price_adults,
            PriceChildren=price_children,
            PriceBabies=price_baby,
            Capacity=capacity
        )

        # Add the new room type to the database
        db.session.add(new_room_type)
        db.session.commit()

        return {'status': 'success', 'message': 'Room type added successfully'}

    except Exception as e:
        db.session.rollback()  # Rollback in case of an error
        return {'status': 'error', 'message': f'Unexpected error: {str(e)}'}

def get_room_types_info():
    """
    Retrieves information about room types, including Name, Description, Facility,
    PriceAdults, PriceChildren, PriceBabies, and Capacity.

    Returns:
        dict: A dictionary containing the status and the list of room type information.
    """
    try:
        # Query the RoomType table to get the required details
        room_types = (
            db.session.query(
                RoomType.Name,
                RoomType.Description,
                RoomType.Facility,
                RoomType.PriceAdults,
                RoomType.PriceChildren,
                RoomType.PriceBabies,
                RoomType.Capacity
            ).all()
        )

        # Format the query results into a list of dictionaries
        room_types_list = [
            {
                'Name': room_type.Name,
                'Description': room_type.Description if room_type.Description else 'N/A',
                'Facility': room_type.Facility if room_type.Facility else 'N/A',
                'PriceAdults': float(room_type.PriceAdults) if room_type.PriceAdults else 0.0,
                'PriceChildren': float(room_type.PriceChildren) if room_type.PriceChildren else 0.0,
                'PriceBabies': float(room_type.PriceBabies) if room_type.PriceBabies else 0.0,
                'Capacity': room_type.Capacity if room_type.Capacity else 0
            }
            for room_type in room_types
        ]

        return {'status': 'success', 'room_types': room_types_list}
    except Exception as e:
        return {'status': 'error', 'message': f'Unexpected error: {str(e)}'}

def update_room_type(data):
    """
    Updates an existing room type in the RoomType table.

    Parameters:
        data (dict): A dictionary containing TypeID and the fields to update such as
                     Name, Description, Facility, PriceAdults, PriceChildren, PriceBabies, Capacity.

    Returns:
        dict: A dictionary with the status of the operation.
    """
    try:
        # Extract the TypeID from the input dictionary
        type_id = data.get('TypeID')

        if not type_id:
            return {'status': 'error', 'message': 'Missing TypeID'}

        # Retrieve the existing room type record based on TypeID
        room_type = RoomType.query.filter_by(TypeID=type_id).first()

        if not room_type:
            return {'status': 'error', 'message': 'RoomType not found'}

        # Update the fields if they are provided in the input data
        room_type.Name = data.get('Name', room_type.Name)
        room_type.Description = data.get('Description', room_type.Description)
        room_type.Facility = data.get('Facility', room_type.Facility)
        room_type.PriceAdults = data.get('PriceAdults', room_type.PriceAdults)
        room_type.PriceChildren = data.get('PriceChildren', room_type.PriceChildren)
        room_type.PriceBabies = data.get('PriceBabies', room_type.PriceBabies)
        room_type.Capacity = data.get('Capacity', room_type.Capacity)

        # Commit the changes to the database
        db.session.commit()

        return {'status': 'success', 'message': 'Room type updated successfully'}

    except Exception as e:
        db.session.rollback()  # Rollback in case of an error
        return {'status': 'error', 'message': f'Unexpected error: {str(e)}'}

def add_new_room(data):
    """
    Inserts a new room into the Room table.

    Parameters:
        data (dict): A dictionary containing RoomNumber and Name (from the RoomType table).

    Returns:
        dict: A dictionary with the status of the operation.
    """
    try:
        # Extract required fields from the input dictionary
        room_number = data.get('RoomNumber')
        room_type_name = data.get('Name')

        # Validate mandatory fields
        if not room_number or not room_type_name:
            return {'status': 'error', 'message': 'Missing RoomNumber or RoomType Name'}

        # Retrieve the RoomType based on the provided Name
        room_type = RoomType.query.filter_by(Name=room_type_name).first()
        if not room_type:
            return {'status': 'error', 'message': f'RoomType with Name "{room_type_name}" not found'}

        # Create a new Room instance
        new_room = Room(
            RoomNumber=room_number,
            TypeID=room_type.TypeID,  # Assuming Room table references RoomType via TypeID
            HotelID=room_type.HotelID  # Copy HotelID from RoomType
        )

        # Add the new room to the database
        db.session.add(new_room)
        db.session.commit()

        return {'status': 'success', 'message': f'Room {room_number} of type "{room_type_name}" added successfully'}

    except Exception as e:
        db.session.rollback()  # Rollback in case of an error
        return {'status': 'error', 'message': f'Unexpected error: {str(e)}'}

def get_rooms_list():
    """
    Retrieves a list of rooms along with their RoomNumber, Name, Status, and Capacity.

    Returns:
        dict: A dictionary containing the status and a list of rooms information.
    """
    try:
        # Perform a join query to retrieve the required data
        rooms_info = (
            db.session.query(
                Room.RoomNumber,
                RoomType.Name,

            )
            .join(RoomType, Room.TypeID == RoomType.TypeID)
            .all()
        )

        # Prepare the data in a dictionary format
        rooms_list = []
        for room_number, name in rooms_info:
            rooms_list.append({
                'RoomNumber': room_number,
                'Name': name,

            })

        return {'status': 'success', 'rooms': rooms_list}
    except Exception as e:
        return {'status': 'error', 'message': f'Unexpected error: {str(e)}'}

def delete_room(data):
    """
    Deletes a room based on the provided RoomNumber and Name.

    Parameters:
        data (dict): A dictionary containing 'RoomNumber' and 'Name' of the room to be deleted.

    Returns:
        dict: A dictionary containing the status of the operation.
    """
    try:
        # Extract RoomNumber and Name from the provided data
        room_number = data.get('RoomNumber')
        name = data.get('Name')

        if not room_number or not name:
            return {'status': 'error', 'message': 'Missing RoomNumber or Name in the request'}

        # Perform a join query to find the room to delete
        room_to_delete = (
            db.session.query(Room)
            .join(RoomType, Room.TypeID == RoomType.TypeID)
            .filter(Room.RoomNumber == room_number, RoomType.Name == name)
            .first()
        )

        if not room_to_delete:
            return {'status': 'error', 'message': 'Room not found with the provided RoomNumber and Name'}

        # Delete the room from the database
        db.session.delete(room_to_delete)
        db.session.commit()

        return {'status': 'success', 'message': f'Room {room_number} with Name "{name}" has been successfully deleted'}
    except Exception as e:
        db.session.rollback()  # Roll back the transaction in case of an error
        return {'status': 'error', 'message': f'Unexpected error: {str(e)}'}

def update_rooms_list(data):
    """
    Updates details of an existing room in the Room table.

    Parameters:
        data (dict): A dictionary containing the RoomNumber and fields to update.
                     Expected keys include RoomNumber, Name (from RoomType), and Status (for Room).

    Returns:
        dict: A dictionary with the status of the operation.
    """
    try:
        # Extract required fields from the input dictionary
        room_number = data.get('RoomNumber')
        room_type_name = data.get('Name')
        status = data.get('Status')

        # Validate mandatory fields
        if not room_number:
            return {'status': 'error', 'message': 'Missing RoomNumber'}

        # Retrieve the room record based on RoomNumber
        room = Room.query.filter_by(RoomNumber=room_number).first()

        if not room:
            return {'status': 'error', 'message': f'Room with RoomNumber {room_number} not found'}

        # If a new RoomType Name is provided, update the TypeID
        if room_type_name:
            room_type = RoomType.query.filter_by(Name=room_type_name).first()
            if not room_type:
                return {'status': 'error', 'message': f'RoomType with Name "{room_type_name}" not found'}
            room.TypeID = room_type.TypeID  # Update TypeID based on the RoomType Name

        # If status is provided, update it
        if status:
            room.Status = status

        # Commit the changes to the database
        db.session.commit()

        return {'status': 'success', 'message': f'Room {room_number} updated successfully'}

    except Exception as e:
        db.session.rollback()  # Rollback in case of an error
        return {'status': 'error', 'message': f'Unexpected error: {str(e)}'}


#Roomboy Functions
def get_room_details_for_room_boy():
    try:
        # Perform a join query to fetch the required details
        room_checkout_details = (
            db.session.query(
                CheckoutDetails.CheckoutDetailsID,
                Room.RoomNumber,
                RoomType.Name.label('RoomTypeName'),
                Hotel.CheckOutTime,
                Booking.CheckoutDate,
                CheckoutDetails.CheckStatus
            )
            .join(RoomType, Room.TypeID == RoomType.TypeID)
            .join(Booking, Room.RoomNumber == Booking.RoomNumber)
            .join(CheckoutDetails, Booking.BookingID == CheckoutDetails.BookingID)
            .join(Hotel, Room.HotelID == Hotel.HotelID)
            .all()
        )

        # Prepare the data in a dictionary format
        checkout_details_list = [
            {
                'CheckoutDetailsID' : detail.CheckoutDetailsID,
                'RoomNumber': detail.RoomNumber,
                'Name': detail.RoomTypeName,
                'CheckOutTime': detail.CheckOutTime if detail.CheckOutTime else 'N/A',
                'CheckoutDate': detail.CheckoutDate.strftime('%Y-%m-%d') if detail.CheckoutDate else 'N/A',
                'CheckStatus': detail.CheckStatus
            }
            for detail in room_checkout_details
        ]

        return {'status': 'success', 'data': checkout_details_list}
    except Exception as e:
        return {'status': 'error', 'message': f'Unexpected error: {str(e)}'}

def update_checkout_details(input_data):
    # Extract the CheckoutDetailsID and data from input_data
    checkout_details_id = input_data.get('CheckoutDetailsID')
    if not checkout_details_id:
        return {'status': 'error', 'message': 'Missing CheckoutDetailsID'}

    data = input_data.get('data', {})

    try:
        # Retrieve the CheckoutDetails record
        checkout_details = CheckoutDetails.query.filter_by(CheckoutDetailsID=checkout_details_id).first()

        if not checkout_details:
            return {'status': 'error', 'message': 'CheckoutDetails not found'}

        # Check the current status
        if checkout_details.CheckStatus == 'checked':
            return {'status': 'success', 'message': 'CheckoutDetails is already checked'}

        # If CheckStatus is 'not checked', update the details
        if checkout_details.CheckStatus == 'Not checked':
            if not data:
                return {'status': 'error', 'message': 'Missing input data for updating CheckoutDetails'}

            # Update columns based on the provided data
            checkout_details.MissingEquipment = data.get('MissingEquipment', checkout_details.MissingEquipment)
            checkout_details.BrokenEquipment = data.get('BrokenEquipment', checkout_details.BrokenEquipment)
            checkout_details.RestaurantFee = data.get('RestaurantFee', checkout_details.RestaurantFee)
            checkout_details.BarFee = data.get('BarFee', checkout_details.BarFee)
            checkout_details.AdditionalFee = data.get('AdditionalFee', checkout_details.AdditionalFee)
            checkout_details.RoomServiceFee = data.get('RoomServiceFee', checkout_details.RoomServiceFee)

            # Calculate the total price
            restaurant_fee = data.get('RestaurantFee', 0) or 0
            bar_fee = data.get('BarFee', 0) or 0
            additional_fee = data.get('AdditionalFee', 0) or 0
            room_service_fee = data.get('RoomServiceFee', 0) or 0

            # Fetch the total price from Booking table
            booking = Booking.query.filter_by(BookingID=checkout_details.BookingID).first()
            if not booking:
                return {'status': 'error', 'message': 'Booking record not found'}

            booking_total_price = booking.TotalPrice or 0
            total_price = restaurant_fee + bar_fee + additional_fee + room_service_fee + booking_total_price

            checkout_details.TotalPrice = total_price

            # Update the CheckStatus to 'checked'
            checkout_details.CheckStatus = 'checked'

            # Commit the changes to the database
            db.session.commit()

            return {'status': 'success', 'message': 'CheckoutDetails successfully updated and checked'}
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
