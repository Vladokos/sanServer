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
    const totalCost = document.getElementById("totalPrice").textContent.split(' ')[2];
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

const increase = (id, idCart, cost) => {
    const input = document.getElementById(id);
    const costField = document.getElementById(idCart);
    const totalCost = document.getElementById('totalPrice');

    input.value = parseInt(input.value) + 1;
    costField.textContent = parseInt(input.value) * parseInt(cost) + "₽";

    const textTotalCost = totalCost.textContent.split(' ');
    textTotalCost[2] = parseInt(textTotalCost[2]) + parseInt(cost);

    totalCost.textContent = textTotalCost.join(' ');


    axios.post("/cart/changeAmount", {
        idCart,
        amount: input.value
    }).then((res) => {
        if (res.status === 200) {

        }
    })
}

const decrease = (id, idCart, cost) => {
    const input = document.getElementById(id);
    const costField = document.getElementById(idCart);
    const totalCost = document.getElementById('totalPrice');

    input.value = parseInt(input.value) - 1;
    costField.textContent = parseInt(input.value) * parseInt(cost) + "₽";

    const textTotalCost = totalCost.textContent.split(' ');
    textTotalCost[2] = parseInt(textTotalCost[2]) - parseInt(cost);

    totalCost.textContent = textTotalCost.join(' ');

    axios.post("/cart/changeAmount", {
        idCart,
        amount: input.value
    }).then((res) => {
        if (res.status === 200) {

        }
    })
}