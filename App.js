/* =========================================================
   MYCFOODS · CARTELERA DIGITAL
   PRUEBA CON LAS 3 FOTOS REALES
========================================================= */

const cartelera = [

    {
        tipo: "foto",
        archivo: "media/fotos/Albóndigas con salsa y puré de papas_20260922_095614_0000.png",
        duracion: 5000
    },

    {
        tipo: "foto",
        archivo: "media/fotos/box_dia_de_la_madre_historia-4.jpg",
        duracion: 5000
    },

    {
        tipo: "foto",
        archivo: "media/fotos/file_00000000ee40820eb02e991bf44310ad.png",
        duracion: 5000
    }

];


const pantalla = document.getElementById("pantalla");

let posicion = 0;
let temporizador = null;


/* =========================================================
   INICIO
========================================================= */

function iniciar() {
    mostrarActual();
}


/* =========================================================
   MOSTRAR ACTUAL
========================================================= */

function mostrarActual() {

    clearTimeout(temporizador);

    const elemento = cartelera[posicion];

    if (!elemento) {
        posicion = 0;
        mostrarActual();
        return;
    }

    pantalla.innerHTML = "";

    const slide = document.createElement("div");

    slide.className = "slide";

    pantalla.appendChild(slide);


    if (elemento.tipo === "foto") {
        mostrarFoto(slide, elemento);
    }

}


/* =========================================================
   FOTO
========================================================= */

function mostrarFoto(slide, elemento) {

    const fondo = document.createElement("img");

    fondo.className = "fondo";

    fondo.src = elemento.archivo;

    slide.appendChild(fondo);


    const foto = document.createElement("img");

    foto.className = "foto";

    foto.src = elemento.archivo;

    foto.alt = "MYCFOODS";

    slide.appendChild(foto);


    const degradado = document.createElement("div");

    degradado.className = "degradado";

    slide.appendChild(degradado);


    foto.onload = () => {

        requestAnimationFrame(() => {
            slide.classList.add("activo");
        });

    };


    foto.onerror = () => {

        console.error(
            "No se pudo cargar:",
            elemento.archivo
        );

        siguiente();

    };


    temporizador = setTimeout(
        siguiente,
        elemento.duracion
    );

}


/* =========================================================
   SIGUIENTE
========================================================= */

function siguiente() {

    clearTimeout(temporizador);

    posicion++;

    if (posicion >= cartelera.length) {
        posicion = 0;
    }

    mostrarActual();

}


/* =========================================================
   INICIAR
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    iniciar
);
