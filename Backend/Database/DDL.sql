CREATE DATABASE hotel;
USE hotel;

CREATE TABLE City (
     City varchar(50) PRIMARY KEY
);


CREATE TABLE Hotel (
    HotelID INT PRIMARY KEY,
    Name VARCHAR(255),
	City varchar(50),
    Address VARCHAR(255),
    Phone VARCHAR(30),
    Email VARCHAR(255),																					
    Stars INT,
	Facilities varchar(255),
    CheckInTime varchar(10),
    CheckOutTime varchar(10),
	Description text,
	FOREIGN KEY (City) REFERENCES City(City) ON DELETE CASCADE
);

CREATE TABLE Staff (
    StaffID INT PRIMARY KEY,
	HotelID INT,
    FullName VARCHAR(50),
	Position varchar(50),
    DateOfBirth DATE,
	PassportSeries varchar(20),
    Address VARCHAR(255),
    Phone VARCHAR(30),
    Email VARCHAR(255),
	Username VARCHAR(50),
	Password VARCHAR(50),
	FOREIGN KEY (HotelID) REFERENCES Hotel(HotelID) ON DELETE CASCADE
);

CREATE TABLE RoomType (
    TypeID INT PRIMARY KEY,
	HotelID INT,
	Name varchar(50),
	Description text,
	Facility text,
	PriceAdults decimal(10,2),
	PriceChildren decimal(10,2),
	PriceBabies decimal(10,2),
	Capacity int,
	FOREIGN KEY (HotelID) REFERENCES Hotel(HotelID) ON DELETE CASCADE
);

CREATE TABLE Room (
    RoomNumber INT PRIMARY KEY,
	HotelID INT,
	TypeID INT,
    Status VARCHAR(20),
	FOREIGN KEY (HotelID) REFERENCES Hotel(HotelID) ON DELETE CASCADE,
	FOREIGN KEY (TypeID) REFERENCES RoomType(TypeID) ON DELETE CASCADE
);

CREATE TABLE Client (
    ClientID INT PRIMARY KEY,
    FullName VARCHAR(50),
    DateOfBirth DATE,
    Address VARCHAR(255),
    Phone VARCHAR(25),
	PassportSeries varchar(20),
    Email VARCHAR(255),
	Username varchar(50),
	Password varchar(100)
);

CREATE TABLE Booking (
    BookingID INT PRIMARY KEY,
    ClientID INT,
	HotelID INT,
    RoomNumber INT,
	AdultsNumber INT,
	ChildrenNumber INT,
    CheckinDate DATE,
    CheckoutDate DATE,
	Duration INT,
    TotalPrice DECIMAL(10, 2),
	FOREIGN KEY (HotelID) REFERENCES Hotel(HotelID) ON DELETE CASCADE,
    FOREIGN KEY (ClientID) REFERENCES Client(ClientID) ON DELETE CASCADE,
    FOREIGN KEY (RoomNumber) REFERENCES Room(RoomNumber) ON DELETE CASCADE
);

CREATE TABLE Payment (
    PaymentID INT PRIMARY KEY,
    BookingID INT,
    Amount DECIMAL(10, 2),
    PaymentDate DATE,
    PaymentMethod VARCHAR(50),
	FOREIGN KEY (BookingID) REFERENCES Booking(BookingID) ON DELETE CASCADE
);

CREATE TABLE CheckinDetails (
   CheckinDetailsID INT PRIMARY KEY,
   ClientID INT,
   BookingID INT,
   TypeID INT,
   Rooms INT,
   PaymentStatus varchar(20),
   FOREIGN KEY (ClientID) REFERENCES Client(ClientID)ON DELETE CASCADE,
   FOREIGN KEY (BookingID) REFERENCES Booking(BookingID) ON DELETE CASCADE,
   FOREIGN KEY (TypeID) REFERENCES RoomType(TypeID) ON DELETE CASCADE
);

CREATE TABLE CheckoutDetails (
    CheckoutDetailsID INT PRIMARY KEY,
    BookingID INT,
	RoomNumber INT,
    MissingEquipment varchar(50),
	BrokenEquipment varchar(50),
	RestaurantFee decimal(10,2),
	BarFee decimal(10,2),
	AdditionalFee decimal(10,2),
	RoomServiceFee decimal(10,2),
	TotalPrice decimal(10,2),
	CheckStatus varchar(20),
    FOREIGN KEY (BookingID) REFERENCES Booking(BookingID)ON DELETE CASCADE,
	FOREIGN KEY (RoomNumber) REFERENCES Room(RoomNumber) ON DELETE CASCADE
);