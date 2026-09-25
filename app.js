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
        10

};


/* =========================================================
   VARIABLES
   ========================================================= */

let contenido = [];

let posicion = 0;

let temporizador = null;

let videoActual = null;

let adminAbierto = false;

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


        await reconstruirURLsLocales();


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
                Number(config.duracion) || 10,

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
                10
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


    document
        .getElementById("adminCerrar")
        .onclick =
        cerrarAdministrador;


    document
        .getElementById("adminAgregar")
        .onclick =
        agregarArchivo;


    document
        .getElementById("menuGuardar")
        .onclick =
        guardarMenuDesdeAdmin;

}


/* =========================================================
   CERRAR ADMIN
   ========================================================= */

function cerrarAdministrador() {

    const panel =
        document.getElementById(
            "admin-cartelera"
        );


    if (panel) {

        panel.remove();

    }


    adminAbierto = false;


    posicion = 0;


    prepararContenido();

}


/* =========================================================
   CARGAR ADMIN
   ========================================================= */

function cargarAdministrador() {

    cargarListaAdmin();

    cargarFormularioMenu();

}


/* =========================================================
   LISTA ADMIN
   ========================================================= */

function cargarListaAdmin() {

    const lista =
        document.getElementById(
            "adminLista"
        );


    if (!lista) {
        return;
    }


    lista.innerHTML = "";


    contenido.forEach(
        function(item, index) {

            const fila =
                document.createElement(
                    "div"
                );


            fila.className =
                "admin-item";


            const numero =
                document.createElement(
                    "div"
                );


            numero.className =
                "admin-numero";


            numero.textContent =
                index + 1;


            const info =
                document.createElement(
                    "div"
                );


            info.className =
                "admin-info";


            const nombre =
                document.createElement(
                    "strong"
                );


            nombre.textContent =
                item.nombre ||
                "Contenido";


            const tipo =
                document.createElement(
                    "small"
                );


            tipo.textContent =
                item.tipo +
                (
                    item.activo === false
                    ? " · OCULTO"
                    : ""
                );


            info.appendChild(
                nombre
            );


            info.appendChild(
                tipo
            );


            fila.appendChild(
                numero
            );


            fila.appendChild(
                info
            );


            if (
                item.tipo !== "video"
            ) {

                const duracion =
                    document.createElement(
                        "input"
                    );


                duracion.className =
                    "admin-duracion";


                duracion.type =
                    "number";


                duracion.min = "1";


                duracion.value =
                    Number(item.duracion) ||
                    5;


                duracion.title =
                    "Segundos";


                duracion.onchange =
                    async function() {

                        item.duracion =
                            Math.max(
                                1,
                                Number(
                                    duracion.value
                                ) || 5
                            );


                        await guardarItemSiLocal(
                            item
                        );

                    };


                fila.appendChild(
                    duracion
                );

            }


            const subir =
                crearBoton(
                    "↑",
                    "admin-btn"
                );


            subir.onclick =
                function() {

                    moverContenido(
                        index,
                        -1
                    );

                };


            fila.appendChild(
                subir
            );


            const bajar =
                crearBoton(
                    "↓",
                    "admin-btn"
                );


            bajar.onclick =
                function() {

                    moverContenido(
                        index,
                        1
                    );

                };


            fila.appendChild(
                bajar
            );


            const activar =
                crearBoton(
                    item.activo === false
                        ? "Mostrar"
                        : "Ocultar",
                    "admin-btn"
                );


            activar.onclick =
                async function() {

                    item.activo =
                        item.activo === false;


                    await guardarItemSiLocal(
                        item
                    );


                    cargarListaAdmin();


                    posicion = 0;

                    prepararContenido();

                };


            fila.appendChild(
                activar
            );


            if (
                item.origen === "local"
            ) {

                const eliminar =
                    crearBoton(
                        "Eliminar",
                        "admin-btn danger"
                    );


                eliminar.onclick =
                    function() {

                        eliminarContenido(
                            item,
                            index
                        );

                    };


                fila.appendChild(
                    eliminar
                );

            }


            lista.appendChild(
                fila
            );

        }
    );

}


/* =========================================================
   CREAR BOTÓN
   ========================================================= */

function crearBoton(
    texto,
    clase
) {

    const boton =
        document.createElement(
            "button"
        );


    boton.className =
        clase;


    boton.textContent =
        texto;


    return boton;

}


/* =========================================================
   MOVER CONTENIDO
   ========================================================= */

async function moverContenido(
    index,
    direccion
) {

    const nuevoIndice =
        index + direccion;


    if (
        nuevoIndice < 0 ||
        nuevoIndice >= contenido.length
    ) {

        return;

    }


    const temporal =
        contenido[index];


    contenido[index] =
        contenido[nuevoIndice];


    contenido[nuevoIndice] =
        temporal;


    for (
        let i = 0;
        i < contenido.length;
        i++
    ) {

        contenido[i].orden =
            i;

        await guardarItemSiLocal(
            contenido[i]
        );

    }


    cargarListaAdmin();


    posicion = 0;

    prepararContenido();

}


/* =========================================================
   GUARDAR ITEM LOCAL
   ========================================================= */

async function guardarItemSiLocal(item) {

    if (
        item.origen !== "local"
    ) {

        return;

    }


    await guardarArchivoLocal(
        item
    );

}


/* =========================================================
   ELIMINAR CONTENIDO
   ========================================================= */

async function eliminarContenido(
    item,
    index
) {

    if (
        item.origen !== "local"
    ) {

        return;

    }


    const confirmar =
        confirm(
            "¿Eliminar este contenido de la cartelera?"
        );


    if (!confirmar) {
        return;
    }


    await borrarArchivoLocal(
        item.id
    );


    contenido.splice(
        index,
        1
    );


    cargarListaAdmin();


    posicion = 0;

    prepararContenido();

}


/* =========================================================
   AGREGAR FOTO / VIDEO
   ========================================================= */

async function agregarArchivo() {

    const input =
        document.getElementById(
            "adminArchivo"
        );


    const mensaje =
        document.getElementById(
            "adminMensaje"
        );


    if (
        !input ||
        !input.files ||
        !input.files.length
    ) {

        mensaje.textContent =
            "Seleccioná primero una foto o video.";

        return;

    }


    const archivo =
        input.files[0];


    const tipo =
        archivo.type.startsWith(
            "video/"
        )
        ? "video"
        : "foto";


    const id =
        "local-" +
        Date.now() +
        "-" +
        Math.random()
            .toString(36)
            .substring(2);


    const nuevo = {

        id: id,

        tipo: tipo,

        nombre:
            archivo.name,

        blob:
            archivo,

        duracion:
            tipo === "foto"
                ? 5
                : 0,

        activo: true,

        origen: "local",

        orden:
            contenido.length

    };


    try {

        await guardarArchivoLocal(
            nuevo
        );


        nuevo.archivo =
            URL.createObjectURL(
                archivo
            );


        contenido.push(
            nuevo
        );


        input.value = "";


        mensaje.textContent =
            "Contenido agregado correctamente.";


        cargarListaAdmin();


        posicion = 0;

        prepararContenido();

    }

    catch(error) {

        console.error(
            error
        );


        mensaje.textContent =
            "No se pudo guardar el archivo.";

    }

}


/* =========================================================
   RECONSTRUIR URLs DE ARCHIVOS LOCALES
   ========================================================= */

async function reconstruirURLsLocales() {

    for (
        const item of contenido
    ) {

        if (
            item.origen === "local" &&
            item.blob &&
            !item.archivo
        ) {

            item.archivo =
                URL.createObjectURL(
                    item.blob
                );

        }

    }

}


/* =========================================================
   FORMULARIO MENÚ
   ========================================================= */

function cargarFormularioMenu() {

    const config =
        obtenerConfiguracion();


    const titulo =
        document.getElementById(
            "menuTitulo"
        );


    const texto =
        document.getElementById(
            "menuTexto"
        );


    const precio =
        document.getElementById(
            "menuPrecio"
        );


    const mostrar =
        document.getElementById(
            "menuMostrar"
        );


    if (titulo) {

        titulo.value =
            config.titulo || "";

    }


    if (texto) {

        texto.value =
            config.texto || "";

    }


    if (precio) {

        precio.value =
            config.precio || "";

    }


    if (mostrar) {

        mostrar.checked =
            config.mostrarMenu === true;

    }

}


/* =========================================================
   GUARDAR MENÚ
   ========================================================= */

function guardarMenuDesdeAdmin() {

    const titulo =
        document.getElementById(
            "menuTitulo"
        );


    const texto =
        document.getElementById(
            "menuTexto"
        );


    const precio =
        document.getElementById(
            "menuPrecio"
        );


    const mostrar =
        document.getElementById(
            "menuMostrar"
        );


    const config = {

        titulo:
            titulo.value.trim() ||
            "MENÚ DEL DÍA",

        texto:
            texto.value.trim(),

        precio:
            precio.value.trim(),

        mostrarMenu:
            mostrar.checked,

        duracion:
            7

    };


    guardarConfiguracion(
        config
    );


    posicion = 0;


    prepararContenido();


    const mensaje =
        document.getElementById(
            "adminMensaje"
        );


    if (mensaje) {

        mensaje.textContent =
            "Menú del Día guardado.";

    }

}


/* =========================================================
   ATAJO ADMIN
   CTRL + ALT + A
   ========================================================= */

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.ctrlKey &&
            event.altKey &&
            event.key.toLowerCase() === "a"
        ) {

            event.preventDefault();

            abrirAdministrador();

        }


        if (
            event.key === "Escape" &&
            adminAbierto
        ) {

            cerrarAdministrador();

        }

    }
);


/* =========================================================
   ABRIR ADMIN POR URL
   ========================================================= */

function comprobarModoAdminURL() {

    const parametros =
        new URLSearchParams(
            window.location.search
        );


    if (
        parametros.get("admin") === "1"
    ) {

        abrirAdministrador();

    }

}


/* =========================================================
   LIMPIEZA DE URLs TEMPORALES
   ========================================================= */

window.addEventListener(
    "beforeunload",
    function() {

        contenido.forEach(
            function(item) {

                if (
                    item.origen === "local" &&
                    item.archivo &&
                    item.archivo.startsWith(
                        "blob:"
                    )
                ) {

                    try {

                        URL.revokeObjectURL(
                            item.archivo
                        );

                    }

                    catch {}

                }

            }
        );

    }
);


/* =========================================================
   INICIO FINAL
   ========================================================= */

(async function() {

    await iniciar();

    prepararContenido();

    comprobarModoAdminURL();

})();
