CREATE TABLE IF NOT EXISTS postcodes
(
    id       INT AUTO_INCREMENT PRIMARY KEY,
    postcode VARCHAR(10) NOT NULL UNIQUE,
    street   VARCHAR(255)     NOT NULL,
    locality VARCHAR(255)     NOT NULL,
    town     VARCHAR(255)     NOT NULL,
    district VARCHAR(255)     NOT NULL,
    county   VARCHAR(255)     NOT NULL
);


CREATE INDEX postcodes_index ON postcodes(postcode);

CREATE TABLE IF NOT EXISTS property_types
(
    id      INT AUTO_INCREMENT PRIMARY KEY,
    initial CHAR(1) UNIQUE NOT NULL,
    name    VARCHAR(255) UNIQUE
);

INSERT INTO property_types (initial, name) VALUE ('D', 'Detached')
ON DUPLICATE KEY UPDATE initial=initial;
INSERT INTO property_types (initial, name) VALUE ('S', 'Semi-Detached')
ON DUPLICATE KEY UPDATE initial=initial;
INSERT INTO property_types (initial, name) VALUE ('T', 'Terraced')
ON DUPLICATE KEY UPDATE initial=initial;
INSERT INTO property_types (initial, name) VALUE ('F', 'Flats/Maisonettes')
ON DUPLICATE KEY UPDATE initial=initial;
INSERT INTO property_types (initial, name) VALUE ('O', 'Other')
ON DUPLICATE KEY UPDATE initial=initial;

CREATE TABLE IF NOT EXISTS durations
(
    id      INT AUTO_INCREMENT PRIMARY KEY,
    initial CHAR(1) UNIQUE NOT NULL,
    name    VARCHAR(255) UNIQUE
);

INSERT INTO durations (initial, name) VALUE ('F', 'Freehold')
ON DUPLICATE KEY UPDATE initial=initial;
INSERT INTO durations (initial, name) VALUE ('L', 'Leasehold')
ON DUPLICATE KEY UPDATE initial=initial;
INSERT INTO durations (initial, name) VALUE ('U', 'Undefined')
ON DUPLICATE KEY UPDATE initial=initial;

CREATE TABLE IF NOT EXISTS houses
(
    id               INT AUTO_INCREMENT PRIMARY KEY,
    postcode_id      INT NOT NULL REFERENCES postcodes (id) ON DELETE RESTRICT,
    paon             VARCHAR(255),
    saon             VARCHAR(255),
    property_type_id INT NOT NULL REFERENCES property_types (id) ON DELETE RESTRICT,
    duration_id      INT NOT NULL REFERENCES durations (id) ON DELETE RESTRICT

);

CREATE INDEX postcodes__index
    ON houses (postcode_id);

CREATE TABLE IF NOT EXISTS transactions
(
    id               INT AUTO_INCREMENT PRIMARY KEY,
    price            NUMERIC NOT NULL,
    date             DATE    NOT NULL,
    house_id         INT     NOT NULL REFERENCES houses (id) ON DELETE RESTRICT,
    is_new           BOOL    NOT NULL
);

CREATE INDEX transactions_timestamp_index ON transactions(date);