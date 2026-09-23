/* =========================================================
   MYCFOODS · CARTELERA DIGITAL
   MOTOR DE REPRODUCCIÓN
========================================================= */


/* =========================================================
   CONFIGURACIÓN
========================================================= */

const CONFIG = {

    // Tiempo de las fotos
    duracionFoto: 5000,

    // Transición entre contenidos
    transicion: 900,

    // Mostrar logo
    mostrarLogo: true

};


/* =========================================================
   CONTENIDO DE PRUEBA
=========================================================

   Más adelante esto será reemplazado por el contenido
   que administremos desde el panel.

========================================================= */

const cartelera = [

    {
        tipo: "foto",
        archivo: "media/fotos/foto1.jpg",
        duracion: 5000
    },

    {
        tipo: "foto",
        archivo: "media/fotos/foto2.jpg",
        duracion: 5000
    },

    {
        tipo: "foto",
        archivo: "media/fotos/foto3.jpg",
        duracion: 5000
    }

];


/* =========================================================
   VARIABLES
========================================================= */

const pantalla = document.getElementById("pantalla");

let posicion = 0;

let temporizador = null;


/* =========================================================
   INICIAR
========================================================= */

function iniciar() {

    if (!CONFIG.mostrarLogo) {

        document.getElementById("marca").style.display = "none";

    }

    mostrarActual();

}


/* =========================================================
   MOSTRAR CONTENIDO
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


    /* =====================================================
       FOTO
    ===================================================== */

    if (elemento.tipo === "foto") {

        mostrarFoto(slide, elemento);

        return;

    }


    /* =====================================================
       VIDEO
    ===================================================== */

    if (elemento.tipo === "video") {

        mostrarVideo(slide, elemento);

        return;

    }

}


/* =========================================================
   MOSTRAR FOTO
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

        console.warn(
            "No se encontró:",
            elemento.archivo
        );

        siguiente();

    };


    temporizador = setTimeout(

        siguiente,

        elemento.duracion || CONFIG.duracionFoto

    );

}


/* =========================================================
   MOSTRAR VIDEO
========================================================= */

function mostrarVideo(slide, elemento) {

    const video = document.createElement("video");

    video.className = "video";

    video.src = elemento.archivo;

    video.autoplay = true;

    video.muted = true;

    video.playsInline = true;

    video.preload = "auto";

    video.setAttribute("playsinline", "");

    slide.appendChild(video);


    video.addEventListener(
        "canplay",
        () => {

            slide.classList.add("activo");

        },
        { once: true }
    );


    video.addEventListener(
        "ended",
        siguiente
    );


    video.addEventListener(
        "error",
        () => {

            console.warn(
                "No se pudo reproducir:",
                elemento.archivo
            );

            siguiente();

        }
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
   INICIO
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    iniciar
);
