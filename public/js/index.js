const goods = document.getElementById("goods");

let activeElement = null;

const getSweet = async (e, id) => {
    if (activeElement) {
        activeElement.classList.remove("active");
    }
    activeElement = e;
    e.classList.add("active");

    await axios.get(`https://sanserv.onrender.com/tableData/${id}}`).then((res) => {
        goods.innerHTML = "";
        goods.innerHTML = res.data;
    })
}

