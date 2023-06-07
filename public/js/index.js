
let activeElement = null;
const getSweet = async (e, id) => {
    activeElement = document.getElementsByClassName('active')[0]

    if (activeElement) {
        activeElement.classList.remove("active");
    }
    activeElement = e;
    e.classList.add("active");

    await axios.get(`https://sanserv.onrender.com/tableData/${id}}`).then((res) => {
        const goods = document.getElementById("goods");

        goods.innerHTML = "";
        goods.innerHTML = res.data;
    })

    localStorage.setItem("savedData", document.body.innerHTML)
}

const loadContent = () => {
    const data = localStorage.getItem("savedData");

    if (data) {
        document.body.innerHTML = data;
    }
}

loadContent();