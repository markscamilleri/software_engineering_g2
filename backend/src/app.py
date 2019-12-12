from flask import Flask, request, jsonify
import postcodes_io_api
import database
import hashlib
import mysql.connector
import secrets

#gpsDatabase = mysql.connector.connect(  # connect to db
#        host="34.89.126.252",  # won't change
#        user="root",  # username for rwx access
#        password="ASE@group.2=100%",
#        database="price_paid_data"  # schema name
#)

#dbex  = gpsDatabase.cursor()


app = Flask(__name__)

@app.route('/getHouses', methods=['POST'])
def postcodesIO():
    frontData = request.get_json()
    latitude = frontData['lat']
    longitude = frontData['lon']
    radius = frontData['radius']
    houseLimit = frontData['limit']
    listOfPostcodes = callAPI(latitude, longitude, houseLimit, radius)
    # houseLimit used here to limit len(listOfPostcodes) amount of values in the SQL WHERE clause.
    varseq = ','.join(['%s']*len(listOfPostcodes))

    statement = (
        f"""SELECT post.id, house.paon, house.saon, post.street, post.postcode, props.initial, trans.price
        FROM postcodes AS post
        INNER JOIN houses AS house
        ON house.postcode_id = post.id
        INNER JOIN transactions AS trans
        ON trans.house_id = house.id
        INNER JOIN property_types AS props
        ON props.id = house.property_type_id
        WHERE post.postcode IN ({varseq});"""
    )

    print(statement)
    print(str(listOfPostcodes))

    result = db.select(query=statement, parameters=listOfPostcodes)
    # --py-pseudo:
    # for postcode in listOfPostcodes (not necessarily a for loop)
    # --sql-pseudo:
    # SELECT (postcode, id, street, county)
    # FROM postcodes WHERE postcode IN str(tuple(listOfPostcodes))
    # SELECT (paon, saon) FROM houses WHERE houses.id = postcodes.id (JOIN. DOUBLE CAUTION.)
    # SELECT price FROM transactions WHERE transactions.id = houses.id (DOUBLE JOIN. TRIPLE CAUTION.)
    # SELECT initial FROM property_types WHERE property_types.id = houses.id (If you don't get it now..)

    print(str(result))

    return jsonify(result)


def callAPI(lat, lon, lim, rad):
    api = postcodes_io_api.Api(debug_http=True)
    listPostcodes = api.get_nearest_postcodes_for_coordinates(
        latitude=lat, longitude=lon, limit=lim, radius=rad)
    onlyPostcodes = []
    for i in range(len(listPostcodes["result"])):
        print(str(i))
        onlyPostcodes.append(listPostcodes["result"][i]["postcode"])
    return onlyPostcodes


# this function is used when creating a new user so a salt can be made
def passwordHash(password):
    salt = secrets.token_hex(16)
    saltedPass = password + salt
    n = hashlib.sha256()
    n.update(str.encode(saltedPass))
    hash2 = n.hexdigest()
    return {'hash2': hash2, 'salt': salt}


def passwordCheckHash(password, salt):  # this function is used when checking hash2
    m = hashlib.sha256()
    saltedPass = password + salt
    m.update(str.encode(saltedPass))
    hash2 = m.hexdigest()
    return hash2


def getSalt(username):  # get the salt of a password from database
    command = "SELECT salt FROM users WHERE username = %s"
    result = db.select(query=command, parameters=(username,))
    if not result:
        return "EMPTY LIST"
    else:
        return result[0]['salt']  # TODO use dict cursor or SQLQueue and refer from there


# This function should be used to check if a username has been taken or not on signup
def usernameExists(username):
    command = "SELECT * FROM users WHERE username = %s"
    result = db.select(query=command, parameters=(username,))
    print(result)
    if len(result):
        return True  # username has been taken
    else:
        return False  # username has't been taken


def checkLogin(username, password):  # this checks for login details in table
    command = "SELECT username, hash2 FROM users WHERE username = %s AND hash2 = %s"
    result = db.select(query=command, parameters=[username, password])
    if len(result):  # username and/or hash2 are correct as found in table
        return True
    else:  # username and/or hash2 are incorrect as not found in table
        return False


def addNewUser(username, hash2, salt):  # adds a new user into the table
    command = "INSERT INTO users (username, hash2, salt) VALUES (%s, %s, %s)"
    db.execute(query=command, parameters=(username, hash2, salt))
   # newCommand = f"INSERT INTO users (username, hash2, salt) VALUES ('{username}', '{hash2}', '{salt}')"
   # dbex.execute(newCommand)
   # gpsDatabase.commit()
   # command2 = "SELECT username, hash2, salt FROM users WHERE username = %s AND hash2 = %s AND salt = %s"
   # result = db.select(query=command2, parameters=(username, hash2, salt))
   # if(len(result)):
   #     return True
   # else:
   #     return False


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data['username']
    hash1 = data['hashedPassword']
    salt = getSalt(username)
    hash2 = passwordCheckHash(hash1, salt)
    if checkLogin(username, hash2):
        # user proceeds to next screen as login details are correct
        res = jsonify(response="True")  # {'response': 'True'}
        return res  # login successful
    else:
        # show that the user has used incorrect details and needs to try again
        res = jsonify(response="False")  # {'response': 'False'}
        return res  # notification needed saying incorrect login details


@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data['username']
    hash1 = data['hashedPassword']
    if usernameExists(username):
        # this block shows that the username already exists in the database and the user needs a different one
        # ' {'response': 'True'}'  # notification needed saying try another username
        res = jsonify(response="True")
        return res
    else:
        # this block shows the username hasn't been taken and the new details are being added into the database
        hashDict = passwordHash(hash1)
        hash2 = hashDict.get('hash2')
        salt = hashDict.get('salt')
        addNewUser(username, hash2, salt)
        # '{'response': 'False'}'  # notification needed saying account made
        res = jsonify(response="False")
        return res


if __name__ == '__main__':
    db = database.SQLQueue.get_instance(
        host="34.89.126.252", user="root", password={change}, database="price_paid_data")
    app.run(host='0.0.0.0', port=80)