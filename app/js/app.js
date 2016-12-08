 //  Маркер работающего javascript

function nojsreplace() {
  if (document.body.className == "no-js") {
    document.body.classList.remove("no-js");
  }
}

document.addEventListener("DOMContentLoaded", nojsreplace);


// открытие и закрытие меню
if ( (document.querySelector(".nav") != null) &&
     (document.querySelector(".nav__toggle-btn") != null) ) {

    // переменные
    var nav = document.querySelector(".nav");
    var toogle = document.querySelector(".nav__toggle-btn");
    // меняем
    toogle.addEventListener("click", function(event) {
      // меняем класс
      nav.classList.toggle("closed");
        });

}
