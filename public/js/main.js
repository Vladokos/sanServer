//open menu && transform burger on burger click
const burger = document.getElementById("burger");
const menu = document.getElementById("menu");

burger.addEventListener("click", () => {
  burger.classList.toggle("active")
  menu.classList.toggle("menu_active")
})

//close menu && transform burger back on anchor click
var clicked_link = document.getElementsByClassName('js-clicked');

for (i = 0; i < clicked_link.length; i++) {
  clicked_link[i].onclick = function () {
    burger.classList.remove("active");
    menu.classList.remove("menu_active");
  }
}

//open popup
// let open_popup = document.querySelector(".open_popup-button");
// let popup_bg = document.querySelector(".popup_bg");
// let popup = document.querySelector(".popup");

// document.addEventListener("click", (e) => {
//     if (e.target === open_popup) {
//       popup_bg.classList.add("active");
//       popup.classList.add("active");
//       sessionStorage.clear();
//     }
//   });

// //close popup
// document.addEventListener("click", (e) => {
//     if (e.target === popup_bg) {
//       popup_bg.classList.remove("active");
//       popup.classList.remove("active");
//       sessionStorage.clear();
//     }
//   });