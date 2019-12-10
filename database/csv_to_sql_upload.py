import csv
import progressbar
import mysql.connector as mariadb
import requests

# UUID_COL = 0
PRICE_COL = 0
DATE_COL = 1
POSTCODE_COL = 2
TYPE_COL = 3
NEW_COL = 4
DURATION_COL = 5
PAON_COL = 6
SAON_COL = 7
STREET_COL = 8
LOCALITY_COL = 9
TOWN_COL = 9
DISTRICT_COL = 11
COUNTY_COL = 12
# PPD_CATEGORY_TYPE_COL = 14
# RECORD_STATUS_COL = 15

property_types_inserted = 0
durations_inserted = 0
ppd_categories_inserted = 0


def alert(message):
    requests.post("https://maker.ifttt.com/trigger/program_output/with/key/mG7Keh0ovdScDbHYvjOWPi0zHuVZueN7uyV5-lUXsX3",
                  json={"value1": "ASE2 SQL Upload", "value2": str(message)})


def get_property_type_id(record, cursor) -> int:
    global property_types_inserted
    cursor.execute("SELECT id FROM property_types WHERE initial = %s", (record[TYPE_COL],))
    if cursor.rowcount == 0:
        cursor.execute("INSERT INTO property_types(initial) VALUE (%s)", (record[TYPE_COL],))
        cursor.execute("SELECT id FROM property_types WHERE initial = %s", (record[TYPE_COL],))
        property_types_inserted += 1

    return cursor.fetchone()["id"]


def get_duration_id(record, cursor) -> int:
    global durations_inserted
    cursor.execute("SELECT id FROM durations WHERE initial = %s", (record[DURATION_COL],))
    if cursor.rowcount == 0:
        cursor.execute("INSERT INTO durations(initial) VALUE (%s)", (record[DURATION_COL],))
        cursor.execute("SELECT id FROM durations WHERE initial = %s", (record[DURATION_COL],))
        durations_inserted += 1

    return cursor.fetchone()["id"]


def get_postcode_id(record, cursor) -> int:
    cursor.execute("SELECT id FROM postcodes WHERE postcode = %s", (record[POSTCODE_COL],))

    if cursor.rowcount == 0:
        cursor.execute(
            "INSERT INTO postcodes (postcode, street, locality, town, district, county) VALUE (%s, %s, %s, %s, %s, %s)",
            (record[POSTCODE_COL], record[STREET_COL], record[LOCALITY_COL], record[TOWN_COL], record[DISTRICT_COL],
             record[COUNTY_COL]))
        cursor.execute("SELECT id FROM postcodes WHERE postcode = %s", (record[POSTCODE_COL],))

    return cursor.fetchone()["id"]


def get_house_id(record, cursor) -> int:
    postcode_id = get_postcode_id(record, cursor)
    property_type_id = get_property_type_id(record, cursor)
    duration_id = get_duration_id(record, cursor)
    cursor.execute(
        "SELECT id, property_type_id, duration_id FROM houses WHERE postcode_id = %s AND paon = %s AND saon = %s",
        (postcode_id, record[PAON_COL], record[SAON_COL]))
    if cursor.rowcount == 0:
        cursor.execute(
            "INSERT INTO houses(postcode_id, paon, saon, property_type_id, duration_id) VALUE (%s, %s, %s, %s, %s)",
            (postcode_id, record[PAON_COL], record[SAON_COL], property_type_id, duration_id))
        cursor.execute(
            "SELECT id, property_type_id, duration_id FROM houses WHERE postcode_id = %s AND paon = %s AND saon = %s",
            (postcode_id, record[PAON_COL], record[SAON_COL]))
        return cursor.fetchone()["id"]

    house = cursor.fetchone()
    if house['duration_id'] == duration_id and house['property_type_id'] == property_type_id:
        return house['id']

    update_query = "UPDATE houses SET "
    update_data = []
    updaters = []
    if house['duration_id'] != duration_id:
        updaters.append("duration_id = %s")
        update_data.append(duration_id)

    if house['property_type_id'] != property_type_id:
        updaters.append("property_type_id = %s")
        update_data.append(property_type_id)

    update_query += ", ".join(updaters)
    update_query += " WHERE id = %s"
    update_data.append(house['id'])
    cursor.execute(update_query, tuple(update_data))

    return house['id']


def get_ppd_category_id(record, cursor) -> int:
    global ppd_categories_inserted
    cursor.execute("SELECT id FROM ppd_categories WHERE initial = %s", (record[PPD_CATEGORY_TYPE_COL],))
    if cursor.rowcount == 0:
        cursor.execute("INSERT INTO ppd_categories(initial) VALUE (%s)", (record[PPD_CATEGORY_TYPE_COL],))
        cursor.execute("SELECT id FROM ppd_categories WHERE initial = %s", (record[PPD_CATEGORY_TYPE_COL],))
        ppd_categories_inserted += 1

    return cursor.fetchone()["id"]


record_status_inserted = 0


def get_record_status_id(record, cursor):
    global record_status_inserted
    cursor.execute("SELECT id FROM record_statuses WHERE initial = %s", (record[RECORD_STATUS_COL],))
    if cursor.rowcount == 0:
        cursor.execute("INSERT INTO record_statuses(initial) VALUE (%s)", (record[RECORD_STATUS_COL],))
        cursor.execute("SELECT id FROM record_statuses WHERE initial = %s", (record[RECORD_STATUS_COL],))
        record_status_inserted += 1

    return cursor.fetchone()["id"]


def put_one_to_db(record, cursor):
    import datetime

    price = float(record[PRICE_COL])
    date = datetime.datetime.strptime(record[DATE_COL], "%Y-%m-%d").date()
    house_id = get_house_id(record, cursor)
    house_id = get_house_id(record, cursor)
    # ppd_category_id = get_ppd_category_id(record, cursor)
    # record_status_id = get_record_status_id(record, cursor)
    is_new = record[NEW_COL] == "N" or record[NEW_COL] == "n"

    insert_stmt = "INSERT INTO transactions(date, price, house_id, is_new)  " \
                  "VALUE (%s, %s, %s, %s)"
    data = (date, price, house_id, is_new)
    cursor.execute(insert_stmt, data)


def put_all_to_db(records):
    mariadb_connection = mariadb.connect(user='{DO NOT COMMIT}', password='{DO NOT COMMIT}', database='price_paid_data', host='{DO NOT COMMIT}')
    widgets = [
        ' [', progressbar.Timer(), ' - ',
        progressbar.Percentage(), '] ',
        progressbar.Bar(),
        ' (', progressbar.AdaptiveETA(), ') ',
    ]

    first_line = True
    for (index, record) in progressbar.progressbar(enumerate(records), redirect_stderr=True, redirect_stdout=True,
                                                   widgets=widgets, max_value=14034809):
        if first_line:  # skip first line
            first_line = False
            continue

        cursor = mariadb_connection.cursor(dictionary=True, buffered=True)
        try:
            put_one_to_db(record, cursor)
            mariadb_connection.commit()
        except Exception as e:
            mariadb_connection.rollback()
            alert(e)
            raise e
        finally:
            cursor.close()


if __name__ == '__main__':
    with open("cleanedData.csv") as file:
        print("Loading CSV to SQL")
        data = csv.reader(file)
        print("Got list of records")
        put_all_to_db(data)
    print("Done")
    alert(f'Done\n\nI have inserted the following new entries: property types: {property_types_inserted}, durations: {durations_inserted}')
