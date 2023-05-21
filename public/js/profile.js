const exit = document.getElementById("exit");

exit.addEventListener("click", () => {
    localStorage.clear();
    window.location.replace("http://127.0.0.1:4000/");
})