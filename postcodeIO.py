from flask import Flask, request, jsonify

app = Flask(__name__) 

@app.route('/getHouses', methods=['POST'])
def postcodesIO():
    frontData = request.get_json()
    latitude = frontData['lat']
    longitude = frontData['longlngitude']
    radius = frontData['radius']

    #Default limit? just in case the user does not stablish it
    houseLimit = frontData['limit']

    listOfPostcodes = callAPI(latitude,longitude,radius)
    listOfPostcodes[houseLimit:]
    # houseList = callKayleshmodule

    # return 

    
    
def callAPI((latitude,longitude, radius):
    api  = postcodes_io_api.Api(debug_http=True)
    listPostcodes = api.get_nearest_postcodes_for_coordinates(latitude,longitude,radius)
    onlyPostcodes = []
    for i in range(len(listPostcodes["result"])):
        print (str(i))
        onlyPostcodes.append(listPostcodes["result"][i]["postcode"])
    return onlyPostcodes



if __name__ == '__main__':
    app.run(host =  '0.0.0.0', port = 80)