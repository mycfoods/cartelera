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

function mostrarContenido() {

    const item = cartelera[posicion];

    pantalla.innerHTML = "";

    const slide = document.createElement("div");
    slide.className = "slide";

    if (item.tipo === "foto") {

        const imagen = document.createElement("img");

        imagen.src = item.archivo;
        imagen.alt = "MYCFOODS";

        imagen.onload = function () {
            slide.appendChild(imagen);
            pantalla.appendChild(slide);

            setTimeout(() => {
                siguiente();
            }, item.duracion);
        };

        imagen.onerror = function () {
            console.error("No se pudo cargar:", item.archivo);
            siguiente();
        };

    }

}

function siguiente() {

    posicion++;

    if (posicion >= cartelera.length) {
        posicion = 0;
    }

    mostrarContenido();
}

mostrarContenido();
