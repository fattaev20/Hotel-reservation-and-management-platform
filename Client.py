
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

