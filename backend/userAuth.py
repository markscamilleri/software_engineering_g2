from flask import Flask, request, jsonify
import mysql.connector
import hashlib
import secrets


app = Flask(__name__)


@app.route('/')
def index():
    return 'hello world'


tableName = "users"
gpsDatabase = mysql.connector.connect(  # connect to db
        host="34.89.126.252",  # won't change
        user="root",  # username for rwx access
        password="ASE@group.2=100%",
        database="Group2DB"  # schema name
)

commander = gpsDatabase.cursor()


def passwordHash(password):  # this function is used when creating a new user so a salt can be made
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
    command = f"SELECT salt FROM {tableName} WHERE username = '{username}'"
    salt = commander.fetchone(command)
    return salt


def usernameExists(username):  # This function should be used to check if a username has been taken or not on signup
    command = f"SELECT * FROM {tableName} WHERE username = '{username}'"
    commander.execute(command)
    if len(commander.fetchall()):
        return True  # username has been taken
    else:
        return False  # username has't been taken


def checkLogin(username, password):  # this checks for login details in table
    command = f"SELECT username, hash2 FROM {tableName} WHERE username = '{username}' AND hash2 = '{password}'"
    commander.execute(command)
    if len(commander.fetchall()):  # username and/or hash2 are correct as found in table
        return True
    else:  # username and/or hash2 are incorrect as not found in table
        return False


def addNewUser(username, hash2, salt):  # adds a new user into the table
    command = f"INSERT INTO {tableName} (username, hash2, salt) VALUES ('{username}', '{hash2}', '{salt}')"
    commander.execute(command)
    gpsDatabase.commit()


# TODO
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


# TODO
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data['username']
    hash1 = data['hashedPassword']
    if usernameExists(username):
        # this block shows that the username already exists in the database and the user needs a different one
        res = jsonify(response="True")  # ' {'response': 'True'}'  # notification needed saying try another username
        return res
    else:
        # this block shows the username hasn't been taken and the new details are being added into the database
        hashDict = passwordHash(hash1)
        hash2 = hashDict.get('hash2')
        salt = hashDict.get('salt')
        addNewUser(username, hash2, salt)
        res = jsonify(response="False")  # '{'response': 'False'}'  # notification needed saying account made
        return res


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=80)
