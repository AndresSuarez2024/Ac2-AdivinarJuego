// Obtener las referencias más importantes a los elementos del DOM
const inputParaula = document.getElementById("paraula");
const displayLletres = document.getElementById("display-lletres");
const botonsContainer = document.getElementById("botons-container");
const intentsImg = document.getElementById("intents-img");
const botoComencarPartida = document.getElementById("comencar-partida");
const body = document.body;
const puntsDisplay = document.getElementById("punts"); 
const partidesGuanyadesDisplay = document.getElementById("partides-guanyades");
const percentatgeDisplay = document.getElementById("percentatge");
const partidaMesPuntsDisplay = document.getElementById("partida-mes-punts"); 

// Variables principales para controlar el juego
let intentsRestants = 10;
let paraulaAEndevinar = "";
let puntsActuals = 0;
let encertsSeguits = 0; 
let totalPartides = 0;
let partidesGuanyades = 0;
let partidaMesPunts = JSON.parse(localStorage.getItem("partidaMesPunts")) || { data: "", punts: 0 };

// Mostrar partida con más puntos desde el almacenamiento local
if (partidaMesPunts.data) {
    partidaMesPuntsDisplay.textContent = `Partida amb més punts: ${partidaMesPunts.data} - ${partidaMesPunts.punts} punts`;
}

// Limitar la entrada para que solo contenga letras
inputParaula.addEventListener("input", () => {
    inputParaula.value = inputParaula.value.replace(/[^a-zA-Z]/g, "");
});

// Función para alternar la visibilidad de la palabra introducida
function toggleVisibility() {
    inputParaula.type = inputParaula.type === "password" ? "text" : "password";
}

// Función para iniciar una nueva partida
function comencarPartida() {
    paraulaAEndevinar = inputParaula.value.toUpperCase();
    
    if (!paraulaAEndevinar) {
        return; 
    }

    // Restablecer variables del juego
    intentsRestants = 10;
    puntsActuals = 0;
    encertsSeguits = 0;
    intentsImg.src = `imagenes/img_0.jpg`;

    // Deshabilitar las letras mostradas
    while (displayLletres.firstChild) {
        displayLletres.removeChild(displayLletres.firstChild);
    }

    // Deshabilitar los botones
    while (botonsContainer.firstChild) {
        botonsContainer.removeChild(botonsContainer.firstChild);
    }

    // Restablecer el color de fondo
    body.style.backgroundColor = "";

    // Crear una representación de las letras de la palabra a adivinar como guiones
    paraulaAEndevinar.split("").forEach(() => {
        const lletraDisplay = document.createElement("span");
        lletraDisplay.textContent = "_ ";
        displayLletres.appendChild(lletraDisplay);
    });

    // Crear botones para cada letra del abecedario
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach(lletra => {
        const boto = document.createElement("button");
        boto.textContent = lletra;
        boto.onclick = () => comprovarLletra(boto, lletra); // Llama la función para comprobar la letra
        botonsContainer.appendChild(boto);
    });

    // Deshabilitar la entrada y el botón de comenzar partida para evitar cambios mientras se juega
    inputParaula.disabled = true;
    botoComencarPartida.disabled = true;
}

// Función para comprobar si una letra está en la palabra a adivinar
function comprovarLletra(boto, lletra) {
    boto.disabled = true; // Deshabilitar el botón al hacer clic
    const posicions = [];
    
    // Buscar las posiciones de la letra en la palabra
    paraulaAEndevinar.split("").forEach((char, index) => {
        if (char === lletra) posicions.push(index);
    });

    if (posicions.length > 0) {
        encertsSeguits++;
        puntsActuals += encertsSeguits * posicions.length;
        puntsDisplay.textContent = `Punts: ${puntsActuals}`;

        posicions.forEach(index => {
            displayLletres.children[index].textContent = lletra + " ";
        });
    } else {
        encertsSeguits = 0;
        puntsActuals = Math.max(0, puntsActuals - 1);
        puntsDisplay.textContent = `Punts: ${puntsActuals}`;
        intentsRestants--;
        intentsImg.src = `imagenes/img_${intentsRestants}.jpg`;

        // Si no hay más intentos, termina el juego
        if (intentsRestants === 0) {
            body.style.backgroundColor = "red";
            mostrarParaula(); 
            totalPartides++;
            actualitzarEstadistiques();
            resetJoc();
            return;
        }
    }

    // Comprobar si se ha adivinado la palabra completa
    const paraulaActual = Array.from(displayLletres.children).map(span => span.textContent.trim()).join("");
    if (paraulaActual === paraulaAEndevinar) {
        body.style.backgroundColor = "green"; 
        totalPartides++;
        partidesGuanyades++;
        
        if (puntsActuals > partidaMesPunts.punts) {
            const dataActual = new Date();
            partidaMesPunts = {
                data: `${dataActual.toLocaleDateString()} ${dataActual.toLocaleTimeString()}`,
                punts: puntsActuals
            };
            localStorage.setItem("partidaMesPunts", JSON.stringify(partidaMesPunts));
        }
        localStorage.setItem("totalPartides", totalPartides);
        localStorage.setItem("partidesGuanyades", partidesGuanyades);
        actualitzarEstadistiques();
        resetJoc();
        return;
    }
}

// Función para mostrar la palabra completa cuando se pierda
function mostrarParaula() {
    for (let i = 0; i < paraulaAEndevinar.length; i++) {
        displayLletres.children[i].textContent = paraulaAEndevinar[i] + " ";
    }
}

// Función para reiniciar el juego sin mostrar la palabra
function resetJoc() {
    inputParaula.disabled = false;
    botoComencarPartida.disabled = false;
    setTimeout(() => {
        body.style.backgroundColor = ""; 
    }, 1000);
    actualitzarEstadistiques();
}

// Función para actualizar las estadísticas
function actualitzarEstadistiques() {
    totalPartides = parseInt(localStorage.getItem("totalPartides") || 0);
    partidesGuanyades = parseInt(localStorage.getItem("partidesGuanyades") || 0);
    const percentatge = totalPartides > 0 ? (partidesGuanyades / totalPartides * 100).toFixed(2) : 0;

    partidesGuanyadesDisplay.textContent = `Partides guanyades: ${partidesGuanyades}`;
    percentatgeDisplay.textContent = `Percentatge guanyades: ${percentatge}%`;
}

window.onload = actualitzarEstadistiques;
