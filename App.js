/* =========================================================
   MYCFOODS · CARTELERA DIGITAL
   PRUEBA CON FOTOS REALES
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

    /* Fondo ampliado */

    const fondo = document.createElement("img");

    fondo.className = "fondo";

    fondo.src = elemento.archivo;

    slide.appendChild(fondo);


    /* Foto principal */

    const foto = document.createElement("img");

    foto.className = "foto";

    foto.src = elemento.archivo;

    foto.alt = "MYCFOODS";

    slide.appendChild(foto);


    /* Degradado */

    const degradado = document.createElement("div");

    degradado.className = "degradado";

    slide.appendChild(degradado);


    /* Cuando carga */

    foto.onload = () => {

        requestAnimationFrame(() => {

            slide.classList.add("activo");

        });

    };


    /* Si hay error */

    foto.onerror = () => {

        console.error(
            "No se pudo cargar:",
            elemento.archivo
        );

        siguiente();

    };


    /* Tiempo */

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
);        tipo: "foto",
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
