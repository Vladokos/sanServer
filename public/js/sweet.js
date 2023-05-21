let userEmail = localStorage.getItem("user");

const inCart = document.getElementById("inCart");


inCart.addEventListener("click", (e) => {
    if (!userEmail) window.location.href = "https://sanserv.onrender.com/registration"

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