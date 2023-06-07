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
    if (arg2 === "primaryKey") {
        return (arg1 === options.data.root.primaryKey) ? options.fn(this) : options.inverse(this);
    }
    return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
})

hbs.registerHelper("ifMore", (arg1, arg2, options) => {
    return (arg1 > arg2) ? options.fn(this) : options.inverse(this);
})

//look inside object and get keys from it
//return like keyValue1,keyValue2
hbs.registerHelper("search", (arg1, arg2, options) => {
    // console.log(Object.keys(arg1).join(","));
    return Object.keys(arg1)
})

hbs.registerHelper("multiplyNumbers", function (thing1, thing2) {
    return thing1 * thing2;
});

app.get("/", async (req, res) => {
    try {
        const [sweetType] = await promisePool.execute("SELECT * FROM `SweetType`");
        // const [types] = await promisePool.execute("SELECT SweetType.Title, COUNT(Sweet.idSweet) as Amount FROM Sweet inner join SweetType ON SweetType.idSweetType = Sweet.TypeSweet group by SweetType.idSweetType");


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

        const [alreadyInCart] = await promisePool.execute("SELECT * FROM `Cart` WHERE idSweet = ?", [idSweet]);
        if (alreadyInCart.length > 0) {
            const amount = ++alreadyInCart[0].Amount;

            await promisePool.execute("UPDATE `Cart` SET Amount = ? WHERE idCart = ?", [amount, alreadyInCart[0].idCart])

        } else {
            const [cart] = await promisePool.execute("INSERT INTO `Cart` (`idSweet`, `idUser`, `Cost`, `Amount`) VALUES (?,?,?,?)", [idSweet, idUsers, cost, 1]);
        }


        res.sendStatus(200);
    } catch (error) {
        console.log(error);
    }
})
app.post("/cart/changeAmount", async (req, res) => {
    try {
        const { idCart, amount } = req.body;

        await promisePool.execute("UPDATE `Cart` SET Amount = ? WHERE idCart = ?", [amount, idCart])


        res.sendStatus(200);
    } catch (error) {
        console.log(error);
    }
})

app.get("/cart/", async (req, res) => {
    res.redirect("/login");
})

app.get("/cart/:email", async (req, res) => {
    try {
        const { email } = req.params;

        const [user] = await promisePool.execute("SELECT * FROM `Users` WHERE Email = ?", [email]);
        const { idUsers } = user[0];

        const [cart] = await promisePool.execute("SELECT * FROM `Cart` WHERE idUser = ?", [idUsers]);

        const returnObject = []
        let totalCost = 0;
        for (let i = 0; i < cart.length; i++) {
            const [sweet] = await promisePool.execute("SELECT * FROM `Sweet` WHERE idSweet = ?", [cart[i].idSweet]);
            sweet[0].Image = "data:image/png;base64," + Buffer.from(sweet[0].Image).toString("base64");

            const obj = {
                idCart: cart[i].idCart,
                image: sweet[0].Image,
                title: sweet[0].Title,
                amount: cart[i].Amount,
                cost: cart[i].Cost
            }

            returnObject.push(obj);

            totalCost += (cart[i].Cost * cart[i].Amount);
        }

        res.render("cart.hbs", {
            sweet: returnObject,
            totalCost
        })

    } catch (error) {
        console.log(error);
    }
})

app.post("/removeCart", async (req, res) => {
    try {
        const { email, idProduct } = req.body;

        const [cart] = await promisePool.execute("DELETE FROM `Cart` WHERE `idCart` = ?", [idProduct]);

        res.sendStatus(200);
    } catch (error) {
        console.log(error);
    }
})

app.post("/remove", async (req, res) => {
    try {
        const { email, totalCost } = req.body;

        const [user] = await promisePool.execute("SELECT * FROM `Users` WHERE Email = ?", [email]);
        const [cart] = await promisePool.execute("SELECT * FROM `Cart` WHERE `idUser` = ?", [user[0].idUsers]);

        for (let i = 0; i < cart.length; i++) {

            await promisePool.execute("INSERT INTO `Order` (`idSweet`, `idUser`, `totalCost`) VALUES (?, ?, ?)", [cart[i].idSweet, cart[i].idUser, totalCost]);

        }
        await promisePool.execute("DELETE FROM `Cart` WHERE `idUser` = ?", [user[0].idUsers]);

        res.sendStatus(200);
    } catch (error) {
        console.log(error);
    }
})

app.get("/profile/:email", async (req, res) => {
    try {
        const { email } = req.params;

        const [user] = await promisePool.execute("SELECT * FROM `Users` WHERE Email = ?", [email]);
        const [order] = await promisePool.execute("SELECT * FROM `Order` WHERE `idUser` = ?", [user[0].idUsers]);

        const orders = [];
        let totalCost = 0;
        for (let i = 0; i < order.length; i++) {

            const [sweet] = await promisePool.execute("SELECT * FROM `Sweet` WHERE idSweet = ?", [order[i].idSweet]);
            sweet[0].Image = "data:image/png;base64," + Buffer.from(sweet[0].Image).toString("base64");

            orders.push({
                image: sweet[0].Image,
                title: sweet[0].Title,
                cost: order[i].totalCost
            })

            totalCost += order[i].totalCost;
        }

        res.render("profile.hbs", {
            user,
            orders,
            totalCost
        })
    } catch (error) {

    }
})

// template

const translateTableName = {
    'Cart': 'Корзина',
    'Order': 'Заказы',
    'Sweet': 'Изделия',
    'SweetType': 'Тип изделия',
    'Users': 'Пользователи'
}
app.get("/tablesName", async (req, res) => {
    try {
        const [names] = await promisePool.execute("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_SCHEMA = 'bqmhnaqsxnyqxujbcp0o'");


        for (let i = 0; i < names.length; i++) {

            names[i].TABLE_NAME = translateTableName[names[i].TABLE_NAME];
        }


        res.render("admin.hbs", {
            names: translateTableName,
        });
    } catch (error) {

    }
});


const usersTranslate = {
    "Почта": "Email",
    "Номер пользователя": "idUsers",
    "Логин": "Name",
    "Пароль": "Password"
}

const sweetTypeTranslate = {
    "Номер типа изделия": "idSweetType",
    "Название": "Title"
}

const sweetTranslate = {
    "Номер изделия": "idSweet",
    "Тип изделия": "TypeSweet",
    "Изображение": "Image",
    "Название": "Title",
    "Описание": "Description",
    "Цена": "Cost",
    "Вес": "heft"
}

const orderTranslate = {
    "Номер заказа": "idOrder",
    "Номер изделия": "idSweet",
    "Номер пользователя": "idUser",
    "Цена": "totalCost"
}

const cartTranslate = {
    "Номер корзины": "idCart",
    "Номер изделия": "idSweet",
    "Номер пользователя": "idUser",
    "Цена": "Cost",
    "Кол-во": "Amount"
}
app.get("/tableColumns/:name", async (req, res) => {
    try {
        const { name } = req.params;

        let [columns] = await promisePool.execute("SELECT COLUMN_NAME, COLUMN_KEY, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = ?", [name]);

        const [data] = await promisePool.execute("SELECT * FROM `" + name + "`");


        for (let i = 0; i < data.length; i++) {
            if (data[i]?.Image) {
                data[i].Image = "data:image/png;base64," + Buffer.from(data[i].Image).toString("base64")
            }
        }



        let colum = columns.map((column) => column.COLUMN_NAME);

        switch (name) {
            case "Users":
                colum = usersTranslate;
                for (let i = 0; i < columns.length; i++) {
                    columns[i].COLUMN_NAME = Object.keys(usersTranslate).find(key => usersTranslate[key] === columns[i].COLUMN_NAME);
                }
                break;
            case "SweetType":
                colum = sweetTypeTranslate;
                for (let i = 0; i < columns.length; i++) {
                    columns[i].COLUMN_NAME = Object.keys(sweetTypeTranslate).find(key => sweetTypeTranslate[key] === columns[i].COLUMN_NAME);
                }
                break;
            case "Sweet":
                colum = sweetTranslate;
                for (let i = 0; i < columns.length; i++) {
                    columns[i].COLUMN_NAME = Object.keys(sweetTranslate).find(key => sweetTranslate[key] === columns[i].COLUMN_NAME);
                }
                break;
            case "Order":
                colum = orderTranslate;
                for (let i = 0; i < columns.length; i++) {
                    columns[i].COLUMN_NAME = Object.keys(orderTranslate).find(key => orderTranslate[key] === columns[i].COLUMN_NAME);
                }
                break;
            case "Cart":
                colum = cartTranslate;
                for (let i = 0; i < columns.length; i++) {
                    columns[i].COLUMN_NAME = Object.keys(cartTranslate).find(key => cartTranslate[key] === columns[i].COLUMN_NAME);
                }
                break;
            default:
                break;
        }

        const primaryKey = columns.find((colum) => { if (colum.COLUMN_KEY === 'PRI') { return colum } }).COLUMN_NAME
        // console.log(colum);
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

        switch (name) {
            case "Users":
                for (let i = 0; i < columnsName.length; i++) {

                    columnsName[i] = usersTranslate[columnsName[i]];
                }
                break;
            case "SweetType":
                for (let i = 0; i < columnsName.length; i++) {

                    columnsName[i] = sweetTypeTranslate[columnsName[i]];
                }
                break;
            case "Sweet":
                for (let i = 0; i < columnsName.length; i++) {

                    columnsName[i] = sweetTranslate[columnsName[i]];
                }
                break;
            case "Order":
                for (let i = 0; i < columnsName.length; i++) {

                    columnsName[i] = orderTranslate[columnsName[i]];
                }
                break;
            case "Cart":
                for (let i = 0; i < columnsName.length; i++) {

                    columnsName[i] = cartTranslate[columnsName[i]];
                }
                break;
            default:
                break;
        }




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
            "INSERT INTO `" +
            name +
            "`(" +
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
        //field is primary key
        let { columnsName, data, field, id } = req.body;

        switch (name) {
            case "Users":
                field = usersTranslate[field];
                for (let i = 0; i < columnsName.length; i++) {

                    columnsName[i] = usersTranslate[columnsName[i]];
                }
                break;
            case "SweetType":
                field = sweetTypeTranslate[field];

                for (let i = 0; i < columnsName.length; i++) {

                    columnsName[i] = sweetTypeTranslate[columnsName[i]];
                }
                break;
            case "Sweet":
                field = sweetTranslate[field];

                for (let i = 0; i < columnsName.length; i++) {

                    columnsName[i] = sweetTranslate[columnsName[i]];
                }
                break;
            case "Order":
                field = orderTranslate[field];

                for (let i = 0; i < columnsName.length; i++) {

                    columnsName[i] = orderTranslate[columnsName[i]];
                }
                break;
            case "Cart":
                field = cartTranslate[field];

                for (let i = 0; i < columnsName.length; i++) {

                    columnsName[i] = cartTranslate[columnsName[i]];
                }
                break;
            default:
                break;
        }

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
            "UPDATE `" +
            name + "`" +
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
        //field is primary key
        let { field, id } = req.body;

        switch (name) {
            case "Users":
                field = usersTranslate[field];

                break;
            case "SweetType":
                field = sweetTypeTranslate[field];

                break;
            case "Sweet":
                field = sweetTranslate[field];
                break;
            case "Order":
                field = orderTranslate[field];
                break;
            case "Cart":
                field = cartTranslate[field];
                break;
            default:
                break;
        }

        const query =
            "DELETE FROM `" +
            name +
            "` WHERE " +
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
