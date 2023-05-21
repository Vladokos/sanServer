const exit = document.getElementById("exit");

exit.addEventListener("click", () => {
    localStorage.clear();
    window.location.replace("https://sanserv.onrender.com/");
})