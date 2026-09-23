/* =========================================================
   MYCFOODS · CARTELERA DIGITAL
   SISTEMA COMPLETO
   ========================================================= */


/* =========================================================
   CONFIGURACIÓN
   ========================================================= */

const DB_NAME = "mycfoods_cartelera";

const DB_VERSION = 1;

const STORE_NAME = "medios";

const CONFIG_KEY = "mycfoods_cartelera_config";


/* =========================================================
   CONTENIDO INICIAL
   Estos son tus archivos actuales de GitHub.
   ========================================================= */

const CONTENIDO_INICIAL = [

    {
        id: "github-foto-1",

        tipo: "foto",

        archivo:
            "media/fotos/Albóndigas con salsa y puré de papas_20260922_095614_0000.png",

        nombre:
            "Albóndigas con salsa y puré de papas",

        duracion: 5,

        activo: true,

        origen: "github"
    },


    {
        id: "github-foto-2",

        tipo: "foto",

        archivo:
            "media/fotos/box_dia_de_la_madre_historia-4.jpg",

        nombre:
            "Box Día de la Madre",

        duracion: 5,

        activo: true,

        origen: "github"
    },


    {
        id: "github-foto-3",

        tipo: "foto",

        archivo:
            "media/fotos/file_00000000ee40820eb02e991bf44310ad.png",

        nombre:
            "Foto MYCFOODS",

        duracion: 5,

        activo: true,

        origen: "github"
    }

];


/* =========================================================
   CONFIGURACIÓN DEL MENÚ
   ========================================================= */

const CONFIG_INICIAL = {

    mostrarMenu: false,

    titulo:
        "MENÚ DEL DÍA",

    texto:
        "",

    precio:
        "",

    duracion:
        7

};


/* =========================================================
   VARIABLES
   ========================================================= */

let contenido = [];

let posicion = 0;

let temporizador = null;

let videoActual = null;

let adminAbierto = false;

let menuActivo = false;

let db = null;


const pantalla =
    document.getElementById("pantalla");


/* =========================================================
   INDEXED DB
   ========================================================= */

function abrirBaseDatos() {

    return new Promise((resolve, reject) => {

        const request =
            indexedDB.open(
                DB_NAME,
                DB_VERSION
            );


        request.onupgradeneeded =
            function(event) {

                const database =
                    event.target.result;


                if (
                    !database.objectStoreNames
                        .contains(STORE_NAME)
                ) {

                    database.createObjectStore(
                        STORE_NAME,
                        {
                            keyPath: "id"
                        }
                    );

                }

            };


        request.onsuccess =
            function(event) {

                db =
                    event.target.result;

                resolve(db);

            };


        request.onerror =
            function() {

                reject(request.error);

            };

    });

}


/* =========================================================
   OBTENER ARCHIVOS LOCALES
   ========================================================= */

async function obtenerArchivosLocales() {

    if (!db) {
        await abrirBaseDatos();
    }


    return new Promise(
        (resolve, reject) => {

            const transaction =
                db.transaction(
                    STORE_NAME,
                    "readonly"
                );


            const store =
                transaction.objectStore(
                    STORE_NAME
                );


            const request =
                store.getAll();


            request.onsuccess =
                function() {

                    resolve(
                        request.result || []
                    );

                };


            request.onerror =
                function() {

                    reject(
                        request.error
                    );

                };

        }
    );

}


/* =========================================================
   GUARDAR ARCHIVO LOCAL
   ========================================================= */

async function guardarArchivoLocal(item) {

    if (!db) {
        await abrirBaseDatos();
    }


    return new Promise(
        (resolve, reject) => {

            const transaction =
                db.transaction(
                    STORE_NAME,
                    "readwrite"
                );


            const store =
                transaction.objectStore(
                    STORE_NAME
                );


            store.put(item);


            transaction.oncomplete =
                function() {

                    resolve();

                };


            transaction.onerror =
                function() {

                    reject(
                        transaction.error
                    );

                };

        }
    );

}


/* =========================================================
   ELIMINAR ARCHIVO LOCAL
   ========================================================= */

async function borrarArchivoLocal(id) {

    if (!db) {
        await abrirBaseDatos();
    }


    return new Promise(
        (resolve, reject) => {

            const transaction =
                db.transaction(
                    STORE_NAME,
                    "readwrite"
                );


            transaction
                .objectStore(STORE_NAME)
                .delete(id);


            transaction.oncomplete =
                function() {

                    resolve();

                };


            transaction.onerror =
                function() {

                    reject(
                        transaction.error
                    );

                };

        }
    );

}


/* =========================================================
   CONFIG LOCAL
   ========================================================= */

function obtenerConfiguracion() {

    try {

        const guardada =
            localStorage.getItem(
                CONFIG_KEY
            );


        if (!guardada) {

            return {
                ...CONFIG_INICIAL
            };

        }


        return {

            ...CONFIG_INICIAL,

            ...JSON.parse(guardada)

        };

    }

    catch {

        return {
            ...CONFIG_INICIAL
        };

    }

}


function guardarConfiguracion(config) {

    localStorage.setItem(
        CONFIG_KEY,
        JSON.stringify(config)
    );

}


/* =========================================================
   INICIO
   ========================================================= */

async function iniciar() {

    try {

        await abrirBaseDatos();


        const locales =
            await obtenerArchivosLocales();


        contenido = [

            ...CONTENIDO_INICIAL,

            ...locales

        ];


        /*
           Eliminamos duplicados por ID.
        */

        const mapa =
            new Map();


        contenido.forEach(
            function(item) {

                mapa.set(
                    item.id,
                    item
                );

            }
        );


        contenido =
            Array.from(
                mapa.values()
            );


        prepararContenido();

    }

    catch(error) {

        console.error(
            "MYCFOODS · Error iniciando cartelera:",
            error
        );


        contenido =
            [...CONTENIDO_INICIAL];


        prepararContenido();

    }

}


/* =========================================================
   CONTENIDO ACTIVO
   ========================================================= */

function obtenerContenidoActivo() {

    let activos =
        contenido.filter(
            function(item) {

                return item.activo !== false;

            }
        );


    const config =
        obtenerConfiguracion();


    if (
        config.mostrarMenu &&
        config.texto.trim()
    ) {

        activos.push({

            id: "menu-del-dia",

            tipo: "menu",

            nombre: "Menú del Día",

            duracion:
                Number(config.duracion) || 7,

            activo: true,

            origen: "sistema"

        });

    }


    return activos;

}


/* =========================================================
   PREPARAR
   ========================================================= */

function prepararContenido() {

    const activos =
        obtenerContenidoActivo();


    if (!activos.length) {

        pantalla.innerHTML = `

            <div class="menu-slide">

                <div class="menu-etiqueta">
                    MYCFOODS
                </div>

                <div class="menu-texto">
                    Cartelera sin contenido
                </div>

            </div>

        `;

        return;

    }


    if (
        posicion >= activos.length
    ) {

        posicion = 0;

    }


    mostrarActual();

}


/* =========================================================
   MOSTRAR ACTUAL
   ========================================================= */

function mostrarActual() {

    limpiarTemporizador();


    const activos =
        obtenerContenidoActivo();


    if (!activos.length) {

        prepararContenido();

        return;

    }


    if (
        posicion >= activos.length
    ) {

        posicion = 0;

    }


    const item =
        activos[posicion];


    pantalla.innerHTML = "";


    videoActual = null;


    if (item.tipo === "foto") {

        mostrarFoto(item);

    }

    else if (item.tipo === "video") {

        mostrarVideo(item);

    }

    else if (item.tipo === "menu") {

        mostrarMenu();

    }

}


/* =========================================================
   FOTO
   ========================================================= */

function mostrarFoto(item) {

    const slide =
        document.createElement("div");


    slide.className =
        "slide";


    const imagen =
        document.createElement("img");


    imagen.className =
        "imagen-principal";


    imagen.src =
        item.archivo;


    imagen.alt =
        item.nombre || "MYCFOODS";


    imagen.draggable = false;


    imagen.onload =
        function() {

            const fondo =
                document.createElement("img");


            fondo.className =
                "fondo";


            fondo.src =
                item.archivo;


            fondo.alt = "";


            const degradado =
                document.createElement("div");


            degradado.className =
                "degradado";


            slide.appendChild(fondo);

            slide.appendChild(imagen);

            slide.appendChild(degradado);


            pantalla.appendChild(slide);


            requestAnimationFrame(
                function() {

                    slide.classList.add(
                        "activo"
                    );

                }
            );


            const segundos =
                Number(item.duracion) || 5;


            temporizador =
                setTimeout(
                    siguiente,
                    segundos * 1000
                );

        };


    imagen.onerror =
        function() {

            console.error(
                "MYCFOODS · Error cargando:",
                item.archivo
            );


            siguiente();

        };

}


/* =========================================================
   VIDEO
   ========================================================= */

function mostrarVideo(item) {

    const slide =
        document.createElement("div");


    slide.className =
        "slide";


    const video =
        document.createElement("video");


    video.className =
        "video-principal";


    video.src =
        item.archivo;


    video.autoplay = true;

    video.muted = true;

    video.playsInline = true;

    video.controls = false;

    video.preload = "auto";


    videoActual = video;


    video.onloadeddata =
        function() {

            slide.appendChild(video);

            pantalla.appendChild(slide);


            requestAnimationFrame(
                function() {

                    slide.classList.add(
                        "activo"
                    );

                }
            );


            video.play()
                .catch(
                    function(error) {

                        console.warn(
                            "Autoplay bloqueado:",
                            error
                        );

                    }
                );

        };


    video.onended =
        function() {

            siguiente();

        };


    video.onerror =
        function() {

            console.error(
                "MYCFOODS · Error reproduciendo:",
                item.archivo
            );


            siguiente();

        };

}


/* =========================================================
   MENÚ DEL DÍA
   ========================================================= */

function mostrarMenu() {

    const config =
        obtenerConfiguracion();


    const slide =
        document.createElement("div");


    slide.className =
        "slide";


    const contenedor =
        document.createElement("div");


    contenedor.className =
        "menu-slide";


    const etiqueta =
        document.createElement("div");


    etiqueta.className =
        "menu-etiqueta";


    etiqueta.textContent =
        config.titulo ||
        "MENÚ DEL DÍA";


    const texto =
        document.createElement("div");


    texto.className =
        "menu-texto";


    texto.textContent =
        config.texto || "";


    contenedor.appendChild(
        etiqueta
    );


    contenedor.appendChild(
        texto
    );


    if (
        config.precio &&
        config.precio.trim()
    ) {

        const precio =
            document.createElement("div");


        precio.className =
            "menu-precio";


        precio.textContent =
            config.precio;


        contenedor.appendChild(
            precio
        );

    }


    slide.appendChild(
        contenedor
    );


    pantalla.appendChild(
        slide
    );


    requestAnimationFrame(
        function() {

            slide.classList.add(
                "activo"
            );

        }
    );


    temporizador =
        setTimeout(
            siguiente,
            (
                Number(config.duracion) ||
                7
            ) * 1000
        );

}


/* =========================================================
   SIGUIENTE
   ========================================================= */

function siguiente() {

    limpiarTemporizador();


    const activos =
        obtenerContenidoActivo();


    if (!activos.length) {

        return;

    }


    posicion++;


    if (
        posicion >= activos.length
    ) {

        posicion = 0;

    }


    mostrarActual();

}


/* =========================================================
   TEMPORIZADOR
   ========================================================= */

function limpiarTemporizador() {

    if (temporizador) {

        clearTimeout(
            temporizador
        );

        temporizador = null;

    }

}


/* =========================================================
   ADMINISTRADOR
   ========================================================= */

function abrirAdministrador() {

    if (adminAbierto) {
        return;
    }


    adminAbierto = true;


    const panel =
        document.createElement("div");


    panel.id =
        "admin-cartelera";


    panel.innerHTML = `

        <div class="admin-overlay">

            <div class="admin-panel">

                <header class="admin-header">

                    <div>

                        <div class="admin-logo">
                            MYCFOODS
                        </div>

                        <span class="admin-subtitulo">
                            Administrador de Cartelera
                        </span>

                    </div>


                    <button
                        class="admin-cerrar"
                        id="adminCerrar"
                    >
                        ×
                    </button>

                </header>


                <div class="admin-body">


                    <h2 class="admin-titulo">
                        Contenido de la cartelera
                    </h2>


                    <div
                        class="admin-lista"
                        id="adminLista"
                    ></div>


                    <div class="admin-seccion">

                        <h3>
                            Agregar foto o video
                        </h3>


                        <input
                            class="admin-file"
                            id="adminArchivo"
                            type="file"
                            accept="image/*,video/*"
                        >


                        <button
                            class="admin-primario"
                            id="adminAgregar"
                        >
                            + AGREGAR A LA CARTELERA
                        </button>


                        <div
                            class="admin-mensaje"
                            id="adminMensaje"
                        ></div>

                    </div>


                    <div class="admin-seccion">

                        <h3>
                            Menú del Día
                        </h3>


                        <input
                            class="admin-input"
                            id="menuTitulo"
                            placeholder="Título"
                        >


                        <textarea
                            class="admin-textarea"
                            id="menuTexto"
                            placeholder="Ejemplo: Suprema napolitana con puré de papa o omelette de queso con ensalada"
                        ></textarea>


                        <input
                            class="admin-input"
                            id="menuPrecio"
                            placeholder="Precio. Ejemplo: $13.500"
                        >


                        <label class="menu-check">

                            <input
                                type="checkbox"
                                id="menuMostrar"
                            >

                            Mostrar Menú del Día en la cartelera

                        </label>


                        <button
                            class="admin-primario"
                            id="menuGuardar"
                        >
                            GUARDAR MENÚ DEL DÍA
                        </button>

                    </div>


                    <div class="admin-seccion">

                        <h3>
                            Información
                        </h3>

                        <div class="admin-mensaje">

                            Los archivos agregados desde este
                            administrador quedan guardados
                            en esta computadora y navegador.

                            Los archivos originales de GitHub
                            permanecen intactos.

                        </div>

                    </div>


                </div>

            </div>

        </div>

    `;


    document.body.appendChild(
        panel
    );


    cargarAdministrador();


 
