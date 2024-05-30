const express = require('express');
const fs = require('node:fs');
const mysql = require('mysql2');

let con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "RootTest@@#"
})

con.connect(function (err) {
    if (err) throw err;
    console.log("sql connected");
})

con.query("USE shmup_levels;", function (err, result) {
    if (err) throw err;
});

const app = express();

app.use(express.json());
app.use(express.text());

app.get('/', (req, res) => {
    res.send('successful response.');
});

app.post('/pub_index', (req, res) => {
    con.query(`SELECT * FROM levels;`, function (err, result) {
        if (err) throw err;

        let noDuplicates = true;
        result.forEach(levelIndex => {
            console.log(levelIndex["id"]);
            if (levelIndex["id"] === req.body["index"]["id"]) {
                noDuplicates = false;
                return;
            }
        });

        if (noDuplicates === true) {
            con.query(
                `INSERT INTO levels VALUES ('${req.body["index"]["id"]}', '${req.body["index"]["levelName"]}', '${req.body["index"]["levelAuthor"]}')`,
                function (err, result) {
                    if (err) {
                        res.status(500);
                        res.send("Error occured while insert levels: " + err);
                        throw err;
                    }
                });
            res.status(200);
            res.send("Index inserted.");
        }
        else {
            res.status(400);
            res.send("Error. Level ID already exists.");
        }
    });
});

app.post('/pub_phases', (req, res) => {
    const dir = __dirname + "\\uploads\\phases\\";
    const filePath = dir + req.get("Level-ID") + ".json";
    fs.writeFile(filePath, req.body, err => {
        if (err) {
            console.log(err);
            res.status(500);
            res.send("Error occured while saving while savin phases: " + err);
        } else {
            // file written successfully
            res.status(200);
            res.send("Phases saved.");
        }
    });
});

app.get('/get_levels', (req, res) => {
    con.query(
        `SELECT * FROM levels;`,
        function (err, result) {
            if (err) {
                res.status(500);
                res.send("Error occured while selecting from levels" + err);
                throw err;
            }
            res.status(200);
            res.send(result);
        });
});

app.get('/get_level_index', (req, res) => {
    con.query(
        `SELECT * FROM levels WHERE id = '${req.get("Level-ID")}';`,
        function (err, result) {
            if (err) {
                res.status(500);
                res.send("Error occured while selecting from levels" + err);
                throw err;
            }
            res.status(200);
            res.send(result);
        });
});

app.get('/get_level_phases', (req, res) => {
    const dir = __dirname + "\\uploads\\phases\\";
    const filePath = dir + req.get("Level-ID") + ".json";
    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.log(err);
            res.status(500);
            res.send("Error occured while reading phases: " + err);
        } else {
            // file gotten successfully
            res.status(200);
            res.send(data);
        }
    });
});

app.listen(3000);
