PRAGMA foreign_keys=ON;
CREATE TABLE Person(pid INTEGER PRIMARY KEY,pseudonym TEXT NOT NULL,ort TEXT NOT NULL);
CREATE TABLE Team(tid INTEGER PRIMARY KEY,name TEXT NOT NULL);
CREATE TABLE Raum(rid INTEGER PRIMARY KEY,name TEXT NOT NULL);
CREATE TABLE Kurs(kid INTEGER PRIMARY KEY,titel TEXT NOT NULL,preis INTEGER NOT NULL,
 maxPlaetze INTEGER NOT NULL,tid INTEGER NOT NULL REFERENCES Team(tid),rid INTEGER REFERENCES Raum(rid));
CREATE TABLE Buchung(pid INTEGER NOT NULL REFERENCES Person(pid),kid INTEGER NOT NULL REFERENCES Kurs(kid),
 status TEXT NOT NULL CHECK(status IN ('aktiv','storniert')),PRIMARY KEY(pid,kid));
CREATE TABLE Kontakt(pid INTEGER PRIMARY KEY REFERENCES Person(pid),email TEXT NOT NULL);
INSERT INTO Person VALUES(1,'ada','Kassel'),(2,'ben','Kassel'),(3,'cora','Fulda'),(4,'dino','Marburg'),(5,'eva','Fulda');
INSERT INTO Team VALUES(1,'Werkstatt'),(2,'Offene Medien'),(3,'Archiv');
INSERT INTO Raum VALUES(1,'Nord'),(2,'Sued');
INSERT INTO Kurs VALUES(10,'Fotobasis',20,3,1,1),(20,'Audiolabor',30,2,2,2),
 (30,'Videoschnitt',40,2,1,NULL),(40,'Datenschutz-Werkstatt',10,4,2,1),(50,'Archiv <offen>',15,2,3,NULL);
INSERT INTO Buchung VALUES(1,10,'aktiv'),(2,10,'aktiv'),(3,10,'storniert'),(2,20,'aktiv'),
 (3,20,'aktiv'),(1,30,'aktiv'),(4,30,'aktiv'),(5,40,'aktiv'),(2,40,'storniert');
INSERT INTO Kontakt VALUES(1,'ada@example.invalid'),(3,'cora@example.invalid');
