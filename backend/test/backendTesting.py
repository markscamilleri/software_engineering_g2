import requests
import json
import unittest


class TestRunningBackend(unittest.TestCase):
    @staticmethod
    def get_request(json):
        headers = {'Content-type': 'application/json', 'Accept': 'application/json'}
        r = requests.post("http://34.89.126.252/getHouses", data=json, headers=headers)
        return r

    def testCaseCorrectParams(self):
        json_dicc = {"lat": 50.82838, "lon": -0.13947, "limit": 4, "radius": 2000}
        json_data = json.dumps(json_dicc)
        r = TestRunningBackend.get_request(json_data)
        self.assertEquals(r.status_code, 200)

    def testCaseCorrectParams2(self):
        json_dicc = {"lat": 50.82838, "lon": -0.13947, "limit": 6, "radius": 4000}
        json_data = json.dumps(json_dicc)
        r = TestRunningBackend.get_request(json_data)
        self.assertEquals(r.status_code, 200)

    def testCaseLatOut(self):
        json_dicc = {"lat": 50.0, "lon": -0.13947, "limit": 4, "radius": 2000}
        json_data = json.dumps(json_dicc)
        r = TestRunningBackend.get_request(json_data)
        self.assertTrue(r.status_code == 200 or "error" in r.json().keys())

    def testCaseLonOut(self):
        json_dicc = {"lat": 50.82838, "lon": 0.081089, "limit": 4, "radius": 2000}
        json_data = json.dumps(json_dicc)
        r = TestRunningBackend.get_request(json_data)
        self.assertTrue(r.status_code == 200 or "error" in r.json().keys())

    def testCaseSmallRadius(self):
        json_dicc = {"lat": 50.82838, "lon": -0.13947, "limit": 4, "radius": 2}
        json_data = json.dumps(json_dicc)
        r = TestRunningBackend.get_request(json_data)
        self.assertTrue(r.status_code == 200 or "error" in r.json().keys())


    def testCaseImpossibleLat(self):
        json_dicc = {"lat": 91.0, "lon": -0.13947, "limit": 4, "radius": 2000}
        json_data = json.dumps(json_dicc)
        r = TestRunningBackend.get_request(json_data)
        self.assertTrue(r.status_code == 200 or "error" in r.json().keys())

    def testCaseImpossibleLon(self):
        json_dicc = {"lat": 50.82838, "lon": -190.5, "limit": 4, "radius": 2000}
        json_data = json.dumps(json_dicc)
        r = TestRunningBackend.get_request(json_data)
        self.assertTrue(r.status_code == 200 or "error" in r.json().keys())

    def testCaseChangedParameters(self):
        json_dicc = {"lat": 2000, "lon": -0.13947, "limit": 50.82838, "radius": 4}
        json_data = json.dumps(json_dicc)
        r = TestRunningBackend.get_request(json_data)
        print(r)
        self.assertTrue(r.status_code == 200 or "error" in r.json().keys())
