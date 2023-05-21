const express = require("express");
const app = express();
const cors = require("cors");
const hbs = require("hbs");

const fs = require("fs");

// get the client
const mysql = require("mysql2");

app.use(cors());
app.use(express.json({ limit: "100mb" }));


app.set("view engine", "hbs");

app.use(express.static(__dirname + '/public'));
hbs.registerPartials(__dirname + "/views/partials/");


// create the connection to database
const pool = mysql.createPool({
    host: "bqmhnaqsxnyqxujbcp0o-mysql.services.clever-cloud.com",
    user: "u1rw4rm1ygkex9jg",
    database: "bqmhnaqsxnyqxujbcp0o",
    password: "DUSvNKosml0d2CII4QU9",
    port: "3306",

    queryFormat: function (query, values) {
        if (!values) return query;
        return query.replace(
            /\:(\w+)/g,
            function (txt, key) {
                if (values.hasOwnProperty(key)) {
                    return this.escape(values[key]);
                }
                return txt;
            }.bind(this)
        );
    },
});

const promisePool = pool.promise();


hbs.registerHelper("ifEquals", (arg1, arg2, options) => {
    return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
})


app.get("/", async (req, res) => {
    try {
        const [sweetType] = await promisePool.execute("SELECT * FROM `SweetType`");

        res.render("index", {
            sweetType
        })
    } catch (error) {

    }
})

app.get("/registration", (req, res) => {
    res.render("registration.hbs");
})

app.post("/createUser", async (req, res) => {
    try {
        const { login, email, password } = req.body;

        const [user] = await promisePool.execute("INSERT INTO `Users` (`Name`, `Email`, `Password`) VALUES (?,?,?)", [login, email, password]);

        res.sendStatus(200);
    } catch (error) {

    }
});

app.get("/login", (req, res) => {
    res.render("login.hbs");
})

app.post("/enterUser", async (req, res) => {
    try {
        const { email, password } = req.body;

        const [user] = await promisePool.execute("SELECT * FROM `Users` WHERE Email = ?", [email]);

        res.sendStatus(200);
    } catch (error) {

    }
})

app.get("/tableData/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const [sweet] = await promisePool.execute("SELECT * FROM `Sweet` WHERE TypeSweet = ?", [id]);

        for (let i = 0; i < sweet.length; i++) {
            if (sweet[i]?.Image) {
                sweet[i].Image = "data:image/png;base64," + Buffer.from(sweet[i].Image).toString("base64")
            }
        }

        // console.log(sweet);
        // const template = hbs.compile("./views/partials/sweets.hbs");
        // const html = template({test:sweet});
        app.render("./partials/sweets.hbs", { sweets: sweet }, (err, html) => {
            res.send(html);
        })

        // console.log(html);
    } catch (error) {

    }
})

app.get("/sweet/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [sweet] = await promisePool.execute("SELECT * FROM `Sweet` WHERE idSweet = ?", [id]);

        for (let i = 0; i < sweet.length; i++) {
            if (sweet[i]?.Image) {
                sweet[i].Image = "data:image/png;base64," + Buffer.from(sweet[i].Image).toString("base64")
            }
        }

        res.render("sweet.hbs", { sweet })

    } catch (error) {

    }
})

app.post("/addToCart", async (req, res) => {
    try {
        const { idSweet, cost, email } = req.body;

        const [user] = await promisePool.execute("SELECT * FROM `Users` WHERE Email = ?", [email]);
        const { idUsers } = user[0];

        const [cart] = await promisePool.execute("INSERT INTO `Cart` (`idSweet`, `idUser`, `Cost`, `Amount`) VALUES (?,?,?,?)", [idSweet, idUsers, cost, 1]);

        res.sendStatus(200);
    } catch (error) {

    }
})

app.get("/cart/", async (req,res) => {
    res.redirect("/login");
})

app.get("/cart/:email", async (req, res) => {
    try {
        const { email } = req.params;

        const [user] = await promisePool.execute("SELECT * FROM `Users` WHERE Email = ?", [email]);
        const { idUsers } = user[0];

        const [cart] = await promisePool.execute("SELECT * FROM `Cart` WHERE idUser = ?", [idUsers]);

        const returnObject = []

        for (let i = 0; i < cart.length; i++) {
            const [sweet] = await promisePool.execute("SELECT * FROM `Sweet` WHERE idSweet = ?", [cart[i].idSweet]);
            sweet[0].Image = "data:image/png;base64," + Buffer.from(sweet[0].Image).toString("base64");

            const obj = {
                image: sweet[0].Image,
                title: sweet[0].Title,
                amount: cart[i].Amount,
                cost: cart[i].Cost
            }

            returnObject.push(obj);

        }

        res.render("cart.hbs", {
            sweet: returnObject
        })

    } catch (error) {
        console.log(error);
    }
})

app.get("/profile/:email", async (req,res) => {
    try {
        const { email } = req.params;

        const [user] = await promisePool.execute("SELECT * FROM `Users` WHERE Email = ?", [email]);
        
        res.render("profile.hbs", {
            user
        })
    } catch (error) {
        
    }
})

// template

app.get("/tablesName", async (req, res) => {
    try {
        const [names] = await promisePool.execute("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_SCHEMA = 'bqmhnaqsxnyqxujbcp0o'");

        res.render("admin.hbs", {
            names
        });
    } catch (error) {

    }
});

app.get("/tableColumns/:name", async (req, res) => {
    try {
        const { name } = req.params;

        const [columns] = await promisePool.execute("SELECT COLUMN_NAME, COLUMN_KEY, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = ?", [name]);

        const [data] = await promisePool.execute("SELECT * FROM `" + name + "`");


        for (let i = 0; i < data.length; i++) {
            if (data[i]?.Image) {
                data[i].Image = "data:image/png;base64," + Buffer.from(data[i].Image).toString("base64")
            }
        }

        // console.log(columns);

        const colum = columns.map((column) => column.COLUMN_NAME);
        const primaryKey = columns.find((colum) => { if (colum.COLUMN_KEY === 'PRI') { return colum } }).COLUMN_NAME

        res.render("table.hbs", {
            columns: colum,
            columnsDataType: columns,
            data: data,
            tableName: name,
            primaryKey
        });
    } catch (error) {
        console.log(error);
    }
})

app.post("/tableAdd/:name", async (req, res) => {
    try {
        const { name } = req.params;

        let { data, columnsName } = req.body;

        columnsName = columnsName.map((name) => "`" + name + "`");
        data = data.map((value) => `'${value}'`);

        let set = " ";

        let bufferValue;

        for (let i = 0; i < columnsName.length; i++) {
            if (i + 1 < columnsName.length) {
                if (columnsName[i] === "`Image`") {
                    bufferValue = Buffer.from(data[i], "base64");
                    set += `BINARY(:bufferValue)` + ",";
                } else {
                    set += data[i] + ",";
                }
            } else {
                if (columnsName[i] === "`Image`") {
                    bufferValue = Buffer.from(data[i], "base64");
                    set += `BINARY(:bufferValue)`;
                } else {
                    set += data[i];
                }
            }
        }


        const query =
            "INSERT INTO " +
            name +
            "(" +
            columnsName.join(",") +
            ") VALUES(" +
            set +
            ")";

        pool.getConnection((err, connection) => {
            connection.query(query, { bufferValue }, (err, respond, fields) => {
                if (!respond) {
                    res.sendStatus(304);

                } else {
                    res.sendStatus(200);
                }
                pool.releaseConnection(connection);
            });
        });

    } catch (error) {
        console.log(error);
    }
})

app.post("/tableChangeData/:name", async (req, res) => {
    try {
        const { name } = req.params;

        let { columnsName, data, field, id } = req.body;

        columnsName = columnsName.map((name) => "`" + name + "`");
        data = data.map((value) => `'${value}'`);

        let set = " SET ";

        let bufferValue;

        for (let i = 0; i < columnsName.length; i++) {
            if (i + 1 < columnsName.length) {
                if (columnsName[i] === "`Image`") {
                    bufferValue = Buffer.from(data[i], "base64");
                    set += columnsName[i] + "=" + `BINARY(:bufferValue)` + ",";
                } else {
                    set += columnsName[i] + "=" + data[i] + ",";
                }
            } else {
                if (columnsName[i] === "`Image`") {
                    bufferValue = Buffer.from(data[i], "base64");
                    set += columnsName[i] + "=" + `BINARY(:bufferValue)`;
                } else {
                    set += columnsName[i] + "=" + data[i];
                }
            }
        }

        const query =
            "UPDATE " +
            name +
            set +
            " WHERE " +
            "`" +
            `${field}` +
            "`" +
            "=" +
            `'${id}'`;
        pool.getConnection((err, connection) => {
            connection.query(query, { bufferValue }, (err, respond, fields) => {
                if (err) throw err;
                if (respond.affectedRows === 0) {
                    res.sendStatus(404)
                } else {
                    res.sendStatus(200);
                }
                pool.releaseConnection(connection);
            });
        });

    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
});

app.post("/tableDeleteData/:name", async (req, res) => {
    try {
        const { name } = req.params;

        const { field, id } = req.body;

        const query =
            "DELETE FROM " +
            name +
            " WHERE " +
            "`" +
            `${field}` +
            "`" +
            "=" +
            `${id}`;
        pool.getConnection((err, connection) => {
            connection.query(query, (err, respond, fields) => {
                if (err) {
                    // console.log(err);
                    res.sendStatus(304);
                } else {
                    res.sendStatus(200);
                }
                pool.releaseConnection(connection);
            });
        });

    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
});

app.listen(4000, () => {
    console.log("Server is waiting");
});
