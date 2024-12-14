def register_roomboy(data):
    # Define the fields that are valid for the Roomboy model
    valid_fields = ['FullName', 'DateOfBirth', 'Address', 'Phone','passwordSeries', 'Email', 'HotelID']

    # Filter the data to include only valid fields
    filtered_data = {key: data[key] for key in valid_fields if key in data}

    # Check if all required fields are provided
    if not all(field in filtered_data for field in valid_fields):
        return {'status': 'error', 'message': 'Missing required fields'}

    try:
        # Generate unique RoomboyID
        while True:
            random_roomboy_id = random.randint(100, 999)
            existing_roomboy = Roomboy.query.filter_by(RoomboyID=random_roomboy_id).first()
            if not existing_roomboy:
                break

        # Add the RoomboyID to the filtered data
        filtered_data['RoomboyID'] = random_roomboy_id

        # Add new roomboy to the database
        roomboy = Roomboy(**filtered_data)
        db.session.add(roomboy)
        db.session.commit()

        return {'status': 'success', 'message': 'Roomboy registered successfully'}
    except Exception as e:
        return {'status': 'error', 'message': str(e)}

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