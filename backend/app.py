from flask import Flask, request, jsonify
import mysql.connector #connector must support SHA-256 hashing of access password, v8.0.18 onwards

app = Flask(__name__) #define Flask listener
dbname = "GPSLocations"
gpsDatabase = mysql.connector.connect(  # connect to db
        host="35.189.64.153",  # won't change
        user="root",  # username for rwx access
        password="ASEgroup2",
        database="Group2DB"  # schema name
)
commander = gpsDatabase.cursor()  # point to db

@app.route("/")
def home():
    return "Hello, World!"

def addInDB(id, lat, lon):
    command = f"INSERT INTO {dbname} (idUUID, latitude, longitude) VALUES ('{id}', '{lat}', '{lon}')"
    commander.execute(command)
    gpsDatabase.commit()

def checkDBOccurs(id):
    command = f"SELECT * FROM {dbname} WHERE idUUID = '{id}'"
    commander.execute(command)
    if len(commander.fetchall()):
        return True #entry exists (replace)
    else:
        return False #no entry (add)

def replaceInDB(id, lat, lon):
    command = f"UPDATE {dbname} SET latitude = '{lat}', longitude = '{lon}' WHERE idUUID = '{id}'"
    commander.execute(command)
    gpsDatabase.commit()

@app.route('/getlocation', methods=['POST'])
def storeDeviceLocation():
    data = request.get_json()
    deviceID = data['deviceID']
    latitude = data['latitude']
    longitude = data['longitude']

    if checkDBOccurs(deviceID):
        replaceInDB(deviceID, latitude, longitude)
    else:
        addInDB(deviceID, latitude, longitude)

    return f'''
           The deviceID is: {deviceID}
    	   The latitude is: {latitude}
    	   The longitude is: {longitude}'''

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=80)
