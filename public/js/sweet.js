let userEmail = localStorage.getItem("user");

const inCart = document.getElementById("inCart");


inCart.addEventListener("click", (e) => {
    if (!userEmail) window.location.href = "http://127.0.0.1:4000/registration"

    //id & cost
    const data = e.target.name.split('/');

    axios.post("/addToCart", {
        idSweet: data[0],
        cost: data[1],
        email: userEmail
    }).then((res) => {
        if (res.status === 200) {
            alert("Успешно");
        }
    }).catch((err) => {

    });
})