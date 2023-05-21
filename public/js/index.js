const goods = document.getElementById("goods");

let activeElement = null;

const getSweet = async (e, id) => {
    if (activeElement) {
        activeElement.classList.remove("active");
    }
    activeElement = e;
    e.classList.add("active");

    await axios.get(`http://127.0.0.1:4000/tableData/${id}}`).then((res) => {
        goods.innerHTML = "";
        goods.innerHTML = res.data;
    })
}

