import requests
import json

def test(json):
    headers = {'Content-type': 'application/json', 'Accept': 'application/json'}
    r = requests.post("http://34.89.126.252/getHouses", data = json, headers = headers)
    return r

def testCaseCorrectParams():
    json_dicc =  { "lat":50.82838, "lon":-0.13947, "limit":4, "radius":2000}
    json_data = json.dumps(json_dicc)
    r = test(json_data)
    json_data = r.json()
    if (r.status_code != 200):
        return -1
    else:
        return 1

def testCaseCorrectParams2():
    json_dicc =  { "lat":50.82838, "lon":-0.13947, "limit":6, "radius":4000}
    json_data = json.dumps(json_dicc)
    r = test(json_data)
    json_data = r.json()
    if (r.status_code != 200):
        return -1
    else:
        return 1
    
def testCaseLatOut():
    json_dicc =  { "lat":50.0, "lon":-0.13947, "limit":4, "radius":2000}
    json_data = json.dumps(json_dicc)
    r = test(json_data)
    if (r.status_code != 200):
        return -1
    else:
        json_data = r.json()
        if("error" in dict.keys(json_data)):
            return 1
        else:
            return -1

def testCaseLonOut():
    json_dicc =  { "lat":50.82838, "lon":0.081089, "limit":4, "radius":2000}
    json_data = json.dumps(json_dicc)
    r = test(json_data)
    if (r.status_code != 200):
        return -1
    else:
        json_data = r.json()
        if("error" in dict.keys(json_data)):
            return 1
        else:
            return -1


def testCaseSmallRadius():
    json_dicc =  { "lat":50.82838, "lon":-0.13947, "limit":4, "radius":2}
    json_data = json.dumps(json_dicc)
    r = test(json_data)
    if (r.status_code != 200):
        return -1
    else:
        json_data = r.json()
        if("error" in dict.keys(json_data)):
            return 1
        else:
            return -1

def testCaseImpossibleLat():
    json_dicc =  { "lat":91.0, "lon":-0.13947, "limit":4, "radius":2000}
    json_data = json.dumps(json_dicc)
    r = test(json_data)
    if (r.status_code != 200):
        return -1
    else:
        json_data = r.json()
        if("error" in dict.keys(json_data)):
            return 1
        else:
            return -1
            
def testCaseImpossibleLon():
    json_dicc =  { "lat":50.82838, "lon":-190.5, "limit":4, "radius":2000}
    json_data = json.dumps(json_dicc)
    r = test(json_data)
    if (r.status_code != 200):
        return -1
    else:
        json_data = r.json()
        if("error" in dict.keys(json_data)):
            return 1
        else:
            return -1

def testCaseChangedParameters():
    json_dicc =  { "lat":2000 , "lon":-0.13947, "limit":50.82838, "radius":4}
    json_data = json.dumps(json_dicc)
    r = test(json_data)
    if (r.status_code != 200):
        return -1
    else:
        json_data = r.json()
        if("error" in dict.keys(json_data)):
            return 1
        else:
            return -1

def testCasesCall():
    testReport = []
    testReport.append(testCaseCorrectParams())
    testReport.append(testCaseCorrectParams2())
    testReport.append(testCaseLatOut())
    testReport.append(testCaseLonOut())
    testReport.append(testCaseSmallRadius())
    testReport.append(testCaseImpossibleLat())
    testReport.append(testCaseImpossibleLon())
    testReport.append(testCaseChangedParameters())


if __name__ == "__main__":
    testCasesCall()
