const columns = document.getElementById("columns");

const saveButton = document.getElementById("save");
const changeButton = document.getElementById("change");
const deleteButton = document.getElementById("delete");

const clickedElement = (e, columns) => {
    const data = e.innerText.split("\n");
    const fields = columns.split(',');

    for (let i = 0; i < fields.length; i++) {
        if (fields[i] === "Image") {
            document.getElementById(fields[i]).files[0] = data[i];
        } else {
            document.getElementById(fields[i]).value = data[i];
        }

    }
}

saveButton.addEventListener("click", async (e) => {
    const tableName = e.target.name.split("/")[0];
    const primaryKey = e.target.name.split("/")[1];
    const columnsName = columns.innerText.split("\n");
    columnsName.splice(columnsName.indexOf(primaryKey), 1);

    const data = [];

    for (let i = 0; i < columnsName.length; i++) {
        if (columnsName[i] === "Image") {
            const file = document.getElementById(columnsName[i]).files[0];

            const getBase64 = (file) =>
                new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => resolve(reader.result);
                });

            let base64;

            base64 = await getBase64(file);

            data.push(base64.substring(22));
        } else {
            data.push(document.getElementById(columnsName[i]).value);
        }
    }

    axios.post(`/tableAdd/${tableName}`, {
        data,
        columnsName
    }).then((res) => {
        if (res.status === 200) {
            alert("Успешно");
            window.location.reload();
        }
    })
})

changeButton.addEventListener("click", (e) => {
    const tableName = e.target.name.split("/")[0];
    const primaryKey = e.target.name.split("/")[1];
    const columnsName = columns.innerText.split("\n");
    const id = document.getElementById(primaryKey).value;

    columnsName.splice(columnsName.indexOf(primaryKey), 1);

    const data = [];

    for (let i = 0; i < columnsName.length; i++) {
        if (columnsName[i] === "Image") {

        } else {
            const value = document.getElementById(columnsName[i]).value;
            if (value.length > 0) {
                data.push(value);
            } else {
                return alert("Заполните все поля");
            }
        }
    }

    axios.post(`/tableChangeData/${tableName}`, {
        columnsName,
        data,
        field: primaryKey,
        id
    }).then((res) => {
        if (res.status === 200) {
            alert("Успешно");
            window.location.reload();
        }
    }).catch((err) => {
        if (err.response.status === 404) {
            alert("Данной записи в таблице не существует");
            window.location.reload();
        }
    })
})

deleteButton.addEventListener("click", (e) => {
    const tableName = e.target.name.split("/")[0];
    const primaryKey = e.target.name.split("/")[1];
    const id = document.getElementById(primaryKey).value;

    if (id.length > 0) {
        axios.post(`/tableDeleteData/${tableName}`, {
            field: primaryKey,
            id
        }).then(res => {
            if (res.status === 200) {
                alert("Успешно");
                window.location.reload();
            }
        })
    } else {
        alert("Выберите поле для удаления")
    }
})
