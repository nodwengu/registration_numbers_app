DROP TABLE IF EXISTS towns, registrations;

CREATE TABLE towns(
    town_id SERIAL NOT NULL PRIMARY KEY,
    town_name TEXT NOT NULL ,
    town_code TEXT NOT NULL
);

CREATE TABLE registrations(
    reg_id SERIAL NOT NULL,
    reg_number TEXT NOT NULL PRIMARY KEY,
    town_id INT NOT NULL,
    FOREIGN KEY (town_id) REFERENCES towns(town_id)
);

INSERT INTO towns (town_name, town_code)
VALUES('Cape Town','CA'),('Bellville', 'CY'),('Paarl', 'CJ'),('Stellenbosch', 'CL');