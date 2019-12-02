from flask import Flask, request, jsonify 
import postcodes_io_api 
import database 
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
    
    statement = (
	"""SELECT post.id, house.paon, house.saon, post.street, post.postcode, props.initial, trans.price FROM postcodes AS post INNER JOIN houses AS house ON house.postcode_id = post.id INNER JOIN transactions AS trans ON trans.house_id = 
house.id INNER JOIN property_types AS props ON props.id = house.property_type_id WHERE post.postcode IN ({seq});""".format(seq=','.join(['%s']*len(listOfPostcodes)))
	)
    print(statement)
    print(str(listOfPostcodes))
    result = db.select(query=statement, parameters=listOfPostcodes)
    # --py-pseudo: for postcode in listOfPostcodes not necessarily a for loop --sql-pseudo: SELECT (postcode, id, street, county) FROM postcodes WHERE postcode IN str(tuple(listOfPostcodes)) SELECT (paon, saon) FROM houses WHERE houses.id = 
    # postcodes.id (JOIN. DOUBLE CAUTION.) SELECT price FROM transactions WHERE transactions.id = houses.id (DOUBLE JOIN. TRIPLE CAUTION.) SELECT initial FROM property_types WHERE property_types.id = houses.id (If you don't get it now..)
    print(str(result))
    return jsonify(result) 

def callAPI(lat, lon, rad, lim):
    api = postcodes_io_api.Api(debug_http=True)
    listPostcodes = api.get_nearest_postcodes_for_coordinates(latitude=lat, longitude=lon, limit=lim, radius=rad)
    onlyPostcodes = []
    for i in range(len(listPostcodes["result"])):
        print(str(i))
        onlyPostcodes.append(listPostcodes["result"][i]["postcode"])
    return onlyPostcodes 

if __name__ == '__main__':
    db = database.SQLQueue.get_instance(host="34.89.126.252", user="root", password="ASE@group.2=100%", database="price_paid_data")
    app.run(host='0.0.0.0', port=80)
