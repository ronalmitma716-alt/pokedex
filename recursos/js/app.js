var totalPokemon = 0
let todos = []
let filtrados = []
let pagina = 1
const porPagina = 12

const lista = document.getElementById("lista")
const buscador = document.getElementById("buscador")
const mensaje = document.getElementById("mensaje")
const btnAnterior = document.getElementById("anterior")
const btnSiguiente = document.getElementById("siguiente")
const textoPagina = document.getElementById("textoPagina")
const modal = document.getElementById("modal")
const contenidoModal = document.getElementById("contenidoModal")

class Pokemon {
    constructor(id, nombre) {
        this.id = id
        this.nombre = nombre
    }
    imagen() {
        return "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/" + this.id + ".png"
    }
    crearTarjeta() {
        const tarjeta = document.createElement("div")
        tarjeta.classList.add("tarjeta")
        tarjeta.innerHTML = "<img src='" + this.imagen() + "' alt='" + this.nombre + "'>" +
            "<h3>" + this.nombre + "</h3>" +
            "<p>N: " + this.id + "</p>" +
            "<button data-id='" + this.id + "'>Ver detalle</button>"
        return tarjeta
    }
}

function colorTipo(tipo) {
    switch (tipo) {
        case "fire":
            return "orangered"
        case "water":
            return "royalblue"
        case "grass":
            return "green"
        case "electric":
            return "goldenrod"
        case "poison":
            return "purple"
        case "bug":
            return "olive"
        case "flying":
            return "skyblue"
        case "ground":
            return "peru"
        case "psychic":
            return "deeppink"
        case "ghost":
            return "indigo"
        default:
            return "gray"
    }
}

function cargarPokemon() {
    mensaje.textContent = "Cargando..."

    fetch("https://pokeapi.co/api/v2/pokemon?limit=1025")
        .then(function (respuesta) {
            if (!respuesta.ok) {
                throw new Error("Error " + respuesta.status)
            }
            return respuesta.json()
        })
        .then(function (datos) {
            todos = datos.results
            filtrados = todos
            totalPokemon = todos.length
            console.log(typeof todos)
            console.log(totalPokemon)
            document.getElementById("total").textContent = "Total de pokemon: " + totalPokemon
            mostrarPagina()
        })
        .catch(function (error) {
            mensaje.textContent = "No se pudo cargar la informacion. " + error.message
        })
}

function obtenerId(url) {
    const partes = url.split("/")
    return partes[partes.length - 2]
}

function mostrarPagina() {
    lista.innerHTML = ""

    if (filtrados.length === 0) {
        mensaje.textContent = "No se encontraron resultados"
        textoPagina.textContent = "Pagina 0 de 0"
        btnAnterior.disabled = true
        btnSiguiente.disabled = true
        return
    } else if (filtrados.length === 1) {
        mensaje.textContent = "Se encontro 1 pokemon"
    } else {
        mensaje.textContent = "Se encontraron " + filtrados.length + " pokemon"
    }

    const totalPaginas = Math.ceil(filtrados.length / porPagina)
    const inicio = (pagina - 1) * porPagina
    const fin = Math.min(inicio + porPagina, filtrados.length)

    for (let i = inicio; i < fin; i++) {
        const pokemon = new Pokemon(obtenerId(filtrados[i].url), filtrados[i].name)
        lista.appendChild(pokemon.crearTarjeta())
    }

    textoPagina.textContent = "Pagina " + pagina + " de " + totalPaginas
    btnAnterior.disabled = pagina === 1
    btnSiguiente.disabled = pagina === totalPaginas
}

buscador.addEventListener("input", function () {
    const texto = buscador.value.toLowerCase().trim()
    filtrados = []

    for (let i = 0; i < todos.length; i++) {
        if (todos[i].name.includes(texto)) {
            filtrados.push(todos[i])
        }
    }

    pagina = 1
    mostrarPagina()
})

btnAnterior.addEventListener("click", function () {
    if (pagina > 1) {
        pagina--
        mostrarPagina()
    }
})

btnSiguiente.addEventListener("click", function () {
    pagina++
    mostrarPagina()
})

lista.addEventListener("click", function (event) {
    if (event.target.tagName === "BUTTON") {
        verDetalle(event.target.dataset.id)
    }
})

function verDetalle(id) {
    modal.style.display = "flex"
    contenidoModal.innerHTML = "Cargando..."

    fetch("https://pokeapi.co/api/v2/pokemon/" + id)
        .then(function (respuesta) {
            if (!respuesta.ok) {
                throw new Error("Error " + respuesta.status)
            }
            return respuesta.json()
        })
        .then(function (p) {
            let tipos = ""
            let contador = 0
            while (contador < p.types.length) {
                const nombreTipo = p.types[contador].type.name
                tipos = tipos + "<span class='tipo' style='background-color:" + colorTipo(nombreTipo) + "'>" + nombreTipo + "</span>"
                contador++
            }

            let habilidades = ""
            let h = 0
            do {
                habilidades = habilidades + p.abilities[h].ability.name + " "
                h++
            } while (h < p.abilities.length);

            contenidoModal.innerHTML = "<h2>" + p.name + "</h2>" +
                "<img src='" + p.sprites.front_default + "' alt='" + p.name + "'>" +
                "<p>Numero: " + p.id + "</p>" +
                "<p>" + tipos + "</p>" +
                "<p>Altura: " + p.height / 10 + " m</p>" +
                "<p>Peso: " + p.weight / 10 + " kg</p>" +
                "<p>Habilidades: " + habilidades + "</p>" +
                "<p>HP: " + p.stats[0].base_stat + "</p>" +
                "<p>Ataque: " + p.stats[1].base_stat + "</p>" +
                "<p>Defensa: " + p.stats[2].base_stat + "</p>" +
                "<button id='cerrar'>Cerrar</button>"

            document.getElementById("cerrar").addEventListener("click", cerrarModal)
        })
        .catch(function (error) {
            contenidoModal.innerHTML = "<p>No se pudo cargar el detalle. " + error.message + "</p>" +
                "<button id='cerrar'>Cerrar</button>"
            document.getElementById("cerrar").addEventListener("click", cerrarModal)
        })
}

function cerrarModal() {
    modal.style.display = "none"
}

modal.addEventListener("click", function (event) {
    if (event.target === modal) {
        cerrarModal()
    }
})

let fechaActual = new Date()
document.getElementById("fecha").textContent = "Fecha de hoy: " + fechaActual.getDate() + "/" + (fechaActual.getMonth() + 1) + "/" + fechaActual.getFullYear()

cargarPokemon()
