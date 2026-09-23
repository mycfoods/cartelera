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


function mostrarFoto(item) {

    const slide = document.createElement("div");

    slide.className = "slide";


    const fondo = document.createElement("img");

    fondo.className = "fondo";
    fondo.src = item.archivo;
    fondo.alt = "";


    const imagen = document.createElement("img");

    imagen.className = "imagen-principal";
    imagen.src = item.archivo;
    imagen.alt = "MYCFOODS";


    const degradado = document.createElement("div");

    degradado.className = "degradado";


    imagen.onload = function () {

        slide.appendChild(fondo);
        slide.appendChild(imagen);
        slide.appendChild(degradado);

        pantalla.innerHTML = "";

        pantalla.appendChild(slide);


        setTimeout(() => {

            siguiente();

        }, item.duracion);

    };


    imagen.onerror = function () {

        console.error(
            "ERROR AL CARGAR:",
            item.archivo
        );

        siguiente();

    };

}


function mostrarActual() {

    const item = cartelera[posicion];

    if (!item) {
        posicion = 0;
        mostrarActual();
        return;
    }


    if (item.tipo === "foto") {

        mostrarFoto(item);

    }

}


function siguiente() {

    posicion++;

    if (posicion >= cartelera.length) {
        posicion = 0;
    }

    mostrarActual();

}


mostrarActual();
