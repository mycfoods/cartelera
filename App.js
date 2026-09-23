/* =========================================================
   MYCFOODS · CARTELERA DIGITAL
   Reproductor + Administrador local
   ========================================================= */

const DB_NAME = "mycfoods_cartelera";
const DB_VERSION = 1;
const STORE_NAME = "medios";

const CONFIG_KEY = "mycfoods_cartelera_config";

const contenidoInicial = [
    {
        id: "foto-1",
        tipo: "foto",
        archivo: "media/fotos/Albóndigas con salsa y puré de papas_20260922_095614_0000.png",
        nombre: "Albóndigas con salsa y puré de papas",
        duracion: 5,
        activo: true,
        origen: "github"
    },
    {
        id: "foto-2",
        tipo: "foto",
        archivo: "media/fotos/box_dia_de_la_madre_historia-4.jpg",
        nombre: "Box Día de la Madre",
        duracion: 5,
        activo: true,
        origen: "github"
    },
    {
        id: "foto-3",
        tipo: "foto",
        archivo: "media/fotos/file_00000000ee40820eb02e991bf44310ad.png",
        nombre: "Foto MYCFOODS",
        duracion: 5,
        activo: true,
        origen: "github"
    }
];

const configInicial = {
    menuTitulo: "MENÚ DEL DÍA",
    menuTexto: "Cargando menú...",
    menuPrecio: "",
    mostrarMenu: false
};

let contenido = [];
let posicion = 0;
let timer = null;

const pantalla = document.getElementById("pantalla");


/* =========================================================
   BASE DE DATOS
   ========================================================= */

function abrirDB() {

    return new Promise((resolve, reject) => {

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = function () {

            const db = request.result;

            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, {
                    keyPath: "id"
                });
            }
        };

        request.onsuccess = function () {
            resolve(request.result);
        };

        request.onerror = function () {
            reject(request.error);
        };

    });

}


async function guardarMedio(medio) {

    const db = await abrirDB();

    return new Promise((resolve, reject) => {

        const tx = db.transaction(STORE_NAME, "readwrite");

        tx.objectStore(STORE_NAME).put(medio);

        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);

    });

}


async function eliminarMedio(id) {

    const db = await abrirDB();

    return new Promise((resolve, reject) => {

        const tx = db.transaction(STORE_NAME, "readwrite");

        tx.objectStore(STORE_NAME).delete(id);

        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);

    });

}


async function obtenerMedios() {

    const db = await abrirDB();

    return new Promise((resolve, reject) => {

        const tx = db.transaction(STORE_NAME, "readonly");

        const request = tx.objectStore(STORE_NAME).getAll();

        request.onsuccess = () => resolve(request.result);

        request.onerror = () => reject(request.error);

    });

}


/* =========================================================
   CONFIGURACIÓN
   ========================================================= */

function obtenerConfig() {

    try {

        const guardado = localStorage.getItem(CONFIG_KEY);

        if (!guardado) {
            return { ...configInicial };
        }

        return {
            ...configInicial,
            ...JSON.parse(guardado)
        };

    } catch {

        return { ...configInicial };

    }

}


function guardarConfig(config) {

    localStorage.setItem(
        CONFIG_KEY,
        JSON.stringify(config)
    );

}


/* =========================================================
   CARGA INICIAL
   ========================================================= */

async function iniciarCartelera() {

    const mediosGuardados = await obtenerMedios();

    contenido = [
        ...contenidoInicial,
        ...mediosGuardados
    ];

    contenido = contenido.filter((item, index, array) => {

        return array.findIndex(
            x => x.id === item.id
        ) === index;

    });

    prepararContenido();

}


function prepararContenido() {

    contenido = contenido.filter(item => item.activo !== false);

    if (contenido.length === 0) {

        pantalla.innerHTML = `
            <div style="
                width:100%;
                height:100%;
                display:flex;
                align-items:center;
                justify-content:center;
                color:white;
                font-family:Montserrat,sans-serif;
                font-size:30px;
                font-weight:700;
            ">
                MYCFOODS
            </div>
        `;

        return;
    }

    if (posicion >= contenido.length) {
        posicion = 0;
    }

    mostrarActual();

}


/* =========================================================
   REPRODUCTOR
   ========================================================= */

function limpiarTimer() {

    if (timer) {

        clearTimeout(timer);
        timer = null;

    }

}


function mostrarActual() {

    limpiarTimer();

    const item = contenido[posicion];

    if (!item) return;

    pantalla.innerHTML = "";

    if (item.tipo === "foto") {

        mostrarFoto(item);

    } else if (item.tipo === "video") {

        mostrarVideo(item);

    } else if (item.tipo === "menu") {

        mostrarMenu(item);

    }

}


/* =========================================================
   FOTO
   ========================================================= */

function mostrarFoto(item) {

    const slide = crearSlide();

    const imagen = document.createElement("img");

    imagen.className = "imagen-principal";

    imagen.src = item.archivo;

    imagen.alt = item.nombre || "MYCFOODS";


    imagen.onload = function () {

        const fondo = document.createElement("img");

        fondo.className = "fondo";

        fondo.src = item.archivo;

        fondo.alt = "";


        slide.insertBefore(fondo, imagen);

        slide.appendChild(imagen);

        pantalla.appendChild(slide);


        programarSiguiente(item.duracion);

    };


    imagen.onerror = function () {

        console.error(
            "No se pudo cargar:",
            item.archivo
        );

        siguiente();

    };

}


/* =========================================================
   VIDEO
   ========================================================= */

function mostrarVideo(item) {

    const slide = crearSlide();

    const video = document.createElement("video");

    video.className = "video-principal";

    video.src = item.archivo;

    video.autoplay = true;

    video.muted = true;

    video.playsInline = true;

    video.loop = false;

    video.controls = false;


    video.onloadeddata = function () {

        slide.appendChild(video);

        pantalla.appendChild(slide);

        video.play().catch(() => {});

    };


    video.onended = function () {

        siguiente();

    };


    video.onerror = function () {

        console.error(
            "No se pudo reproducir:",
            item.archivo
        );

        siguiente();

    };

}


function crearSlide() {

    const slide = document.createElement("div");

    slide.className = "slide";

    return slide;

}


/* =========================================================
   MENÚ DEL DÍA
   ========================================================= */

function mostrarMenu() {

    const config = obtenerConfig();

    const slide = crearSlide();

    slide.style.cssText = `
        flex-direction:column;
        padding:6vw;
        text-align:center;
        background:
            radial-gradient(
                circle at center,
                #1f1f1f 0%,
                #0b0b0b 65%
            );
    `;


    slide.innerHTML = `

        <div style="
            color:#f1a80a;
            font-size:clamp(22px,3vw,48px);
            font-weight:800;
            letter-spacing:2px;
            margin-bottom:25px;
        ">
            ${escaparHTML(config.menuTitulo)}
        </div>

        <div style="
            color:#ffffff;
            font-size:clamp(28px,4vw,65px);
            font-weight:700;
            line-height:1.15;
            max-width:1100px;
        ">
            ${escaparHTML(config.menuTexto)}
        </div>

        ${
            config.menuPrecio
            ?
            `
            <div style="
                margin-top:35px;
                color:#f1a80a;
                font-size:clamp(25px,3vw,48px);
                font-weight:800;
            ">
                ${escaparHTML(config.menuPrecio)}
            </div>
            `
            :
            ""
        }

    `;


    pantalla.appendChild(slide);

    programarSiguiente(7);

}


/* =========================================================
   SIGUIENTE
   ========================================================= */

function programarSiguiente(segundos) {

    const tiempo = Math.max(
        1,
        Number(segundos) || 5
    );

    timer = setTimeout(
        siguiente,
        tiempo * 1000
    );

}


function siguiente() {

    limpiarTimer();

    if (contenido.length === 0) return;

    posicion++;

    if (posicion >= contenido.length) {
        posicion = 0;
    }

    mostrarActual();

}


/* =========================================================
   ADMINISTRADOR
   ========================================================= */

let adminAbierto = false;


function abrirAdmin() {

    if (adminAbierto) return;

    adminAbierto = true;

    const panel = document.createElement("div");

    panel.id = "admin-cartelera";

    panel.innerHTML = `

        <div class="admin-fondo">

            <div class="admin-panel">

                <div class="admin-header">

                    <div>
                        <strong>MYCFOODS</strong>
                        <span>Cartelera Digital</span>
                    </div>

                    <button id="cerrarAdmin">×</button>

                </div>


                <div class="admin-body">

                    <h2>Contenido</h2>

                    <div id="listaContenido"></div>


                    <div class="admin-seccion">

                        <h2>Agregar foto o video</h2>

                        <input
                            type="file"
                            id="archivoNuevo"
                            accept="image/*,video/*"
                        >

                        <button id="agregarArchivo">
                            + AGREGAR CONTENIDO
                        </button>

                    </div>


                    <div class="admin-seccion">

                        <h2>Menú del día</h2>

                        <input
                            id="menuTitulo"
                            placeholder="Título"
                        >

                        <textarea
                            id="menuTexto"
                            placeholder="Texto del menú"
                        ></textarea>

                        <input
                            id="menuPrecio"
                            placeholder="Precio"
                        >

                        <button id="guardarMenu">
                            GUARDAR MENÚ
                        </button>

                    </div>

                </div>

            </div>

        </div>
    `;


    document.body.appendChild(panel);

    agregarEstilosAdmin();

    cargarPanelAdmin();

    document
        .getElementById("cerrarAdmin")
        .onclick = cerrarAdmin;


    document
        .getElementById("agregarArchivo")
        .onclick = agregarArchivo;


    document
        .getElementById("guardarMenu")
        .onclick = guardarMenuAdmin;

}


function cerrarAdmin() {

    const panel =
        document.getElementById("admin-cartelera");

    if (panel) {
        panel.remove();
    }

    adminAbierto = false;

}


/* =========================================================
   LISTA ADMIN
   ========================================================= */

function cargarPanelAdmin() {

    const lista =
        document.getElementById("listaContenido");

    if (!lista) return;

    lista.innerHTML = "";


    contenido.forEach((item, index) => {

        const fila = document.createElement("div");

        fila.className = "admin-item";


        fila.innerHTML = `

            <div class="admin-numero">
                ${index + 1}
            </div>

            <div class="admin-info">

                <strong>
                    ${escaparHTML(item.nombre || "Contenido")}
                </strong>

                <small>
                    ${item.tipo}
                </small>

            </div>

            <input
                class="admin-duracion"
                type="number"
                min="1"
                value="${item.duracion || 5}"
                title="Duración en segundos"
            >

            <button class="admin-subir">
                ↑
            </button>

            <button class="admin-bajar">
                ↓
            </button>

            <button class="admin-toggle">
                ${item.activo === false ? "Mostrar" : "Ocultar"}
            </button>

            ${
                item.origen === "local"
                ?
                `<button class="admin-eliminar">Eliminar</button>`
                :
                ""
            }

        `;


        const input =
            fila.querySelector(".admin-duracion");

        input.onchange = function () {

            item.duracion =
                Math.max(1, Number(input.value) || 5);

            guardarCambiosAdmin();

        };


        fila.querySelector(".admin-subir").onclick =
            () => moverItem(index, -1);


        fila.querySelector(".admin-bajar").onclick =
            () => moverItem(index, 1);


        fila.querySelector(".admin-toggle").onclick =
            () => toggleItem(index);


        const eliminar =
            fila.querySelector(".admin-eliminar");

        if (eliminar) {

            eliminar.onclick =
                () => eliminarItem(index);

        }


        lista.appendChild(fila);

    });

}


/* =========================================================
   MOVER
   ========================================================= */

function moverItem(index, direccion) {

    const nuevoIndice = index + direccion;

    if (
        nuevoIndice < 0 ||
        nuevoIndice >= contenido.length
    ) {
        return;
    }


    const temporal = contenido[index];

    contenido[index] =
        contenido[nuevoIndice];

    contenido[nuevoIndice] =
        temporal;


    guardarCambiosAdmin();

    cargarPanelAdmin();

    posicion = 0;

    prepararContenido();

}


/* =========================================================
   ACTIVAR / DESACTIVAR
   ========================================================= */

function toggleItem(index) {

    contenido[index].activo =
        contenido[index].activo === false;

    guardarCambiosAdmin();

    cargarPanelAdmin();

    prepararContenido();

}


/* =========================================================
   ELIMINAR
   ========================================================= */

async function eliminarItem(index) {

    const item = contenido[index];

    if (item.origen !== "local") {
        return;
    }


    await eliminarMedio(item.id);

    contenido.splice(index, 1);

    guardarCambiosAdmin();

    cargarPanelAdmin();

    posicion = 0;

    prepararContenido();

}


/* =========================================================
   GUARDAR CAMBIOS
   ========================================================= */

async function guardarCambiosAdmin() {

    for (const item of contenido) {

        if (item.origen === "local") {
            await guardarMedio(item);
        }

    }

}


/* =========================================================
   AGREGAR FOTO / VIDEO
   ========================================================= */

async function agregarArchivo() {

    const input =
        document.getElementById("archivoNuevo");

    if (!input || !input.files.length) {

        alert("Seleccioná una foto o video.");

        return;

    }


    const archivo = input.files[0];

    const tipo =
        archivo.type.startsWith("video/")
        ? "video"
        : "foto";


    const nuevo = {

        id:
            "local-" +
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .substring(2),

        tipo: tipo,

        nombre: archivo.name,

        archivo: URL.createObjectURL(archivo),

        blob: archivo,

        duracion: tipo === "foto" ? 5 : 0,

        activo: true,

        origen: "local"

    };


    await guardarMedio(nuevo);

    contenido.push(nuevo);

    cargarPanelAdmin();

    posicion = 0;

    prepararContenido();

    input.value = "";

}


/* =========================================================
   MENÚ ADMIN
   ========================================================= */

function guardarMenuAdmin() {

    const titulo =
        document.getElementById("menuTitulo").value;

    const texto =
        document.getElementById("menuTexto").value;

    const precio =
        document.getElementById("menuPrecio").value;


    const config = obtenerConfig();

    config.menuTitulo =
        titulo || "MENÚ DEL DÍA";

    config.menuTexto =
        texto || "";

    config.menuPrecio =
        precio || "";

    config.mostrarMenu = true;


    guardarConfig(config);

    alert("Menú guardado.");

}


/* =========================================================
   ESTILOS ADMIN
   ========================================================= */

function agregarEstilosAdmin() {

    if (document.getElementById("estilos-admin")) {
        return;
    }


    const style = document.createElement("style");

    style.id = "estilos-admin";


    style.textContent = `

        #admin-cartelera {
            position:fixed;
            inset:0;
            z-index:99999;
            font-family:Montserrat,Arial,sans-serif;
        }

        .admin-fondo {
            position:absolute;
            inset:0;
            background:rgba(0,0,0,.88);
            display:flex;
            align-items:center;
            justify-content:center;
            padding:25px;
        }

        .admin-panel {
            width:min(1100px,100%);
            max-height:92vh;
            overflow:auto;
            background:#141414;
            border:1px solid #333;
            border-radius:16px;
            color:#fff;
            box-shadow:0 20px 70px rgba(0,0,0,.7);
        }

        .admin-header {
            display:flex;
            justify-content:space-between;
            align-items:center;
            padding:20px 25px;
            border-bottom:1px solid #292929;
        }

        .admin-header strong {
            display:block;
            font-size:22px;
            letter-spacing:2px;
        }

        .admin-header span {
            display:block;
            color:#999;
            margin-top:4px;
        }

        .admin-header button {
            width:42px;
            height:42px;
            border:0;
            border-radius:50%;
            background:#222;
            color:#fff;
            font-size:30px;
            cursor:pointer;
        }

        .admin-body {
            padding:25px;
        }

        .admin-body h2 {
            margin:0 0 15px;
        }

        #listaContenido {
            display:flex;
            flex-direction:column;
            gap:8px;
        }

        .admin-item {
            display:flex;
            align-items:center;
            gap:10px;
            padding:12px;
            background:#0b0b0b;
            border:1px solid #292929;
            b
