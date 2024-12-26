import bcrypt
test = "siuu777"
hashed_password = bcrypt.hashpw(test.encode('utf-8'), bcrypt.gensalt())
print(hashed_password)