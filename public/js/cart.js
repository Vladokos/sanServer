const removeProduct = (idProduct) => {
    axios.post("/removeCart", {
        email: email.value,
        idProduct
    }).then((res) => {
        if (res.status === 200) {
            alert("Успешно");
            window.location.reload();
        }
    })
}

const ordering = () => {
    const user = localStorage.getItem("user")
    const totalCost = document.getElementById("totalPrice").className;
    axios.post("/remove", {
        email: user,
        totalCost
    }).then((res) => {
        if (res.status === 200) {
            alert("Успешно");
            window.location.reload();
        }
    })
}