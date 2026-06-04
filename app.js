const modulos = [
  {
    numero: 1,
    titulo: "Sistemas de Ecuaciones",
    etiqueta: "MODULO1_SISTEMAS_ECUACIONES",
    escenarios: ["A", "F"],
    descripcion:
      "Analiza abastecimiento, transporte, distribucion de recursos y rumores mediante Jacobi, Gauss-Seidel, SOR, Gradiente Conjugado y LU.",
    responsable: "Casilla Rengel Paola Nathaly",
    ruta: "MODULO1_SISTEMAS_ECUACIONES/Sistemasindex.html",
    color: "#2563eb",
    colorSuave: "rgba(37, 99, 235, 0.12)"
  },
  {
    numero: 2,
    titulo: "Raices de Ecuaciones",
    etiqueta: "MODULO2_RAICES",
    escenarios: ["E"],
    descripcion:
      "Encuentra el punto critico donde el gasto, abastecimiento o reserva llega a un limite usando Biseccion, Newton-Raphson y Secante.",
    responsable: "Persona 2 - Ronaldo Charca Condori",
    ruta: "MODULO2_RAICES/Raicesindex.html",
    color: "#7c3aed",
    colorSuave: "rgba(124, 58, 237, 0.12)"
  },
  {
    numero: 3,
    titulo: "Interpolacion",
    etiqueta: "MODULO3_INTERPOLACION",
    escenarios: ["C"],
    descripcion:
      "Estima precios faltantes de productos basicos usando datos dispersos del mes mediante Lagrange, Newton Interpolacion y Splines Cubicos.",
    responsable: "Persona 2 - Ronaldo Charca Condori",
    ruta: "MODULO3_INTERPOLACION/Interpolacionindex.html",
    color: "#10b981",
    colorSuave: "rgba(16, 185, 129, 0.12)"
  },
  {
    numero: 4,
    titulo: "Integracion Numerica",
    etiqueta: "MODULO4_INTEGRACION_NUMERICA",
    escenarios: ["D"],
    descripcion:
      "Calcula costos acumulados y perdida del poder adquisitivo familiar mediante metodos de integracion numerica.",
    responsable: "Persona 3 - Ericka Fabiola Barrionuevo Chavez",
    ruta: "MODULO4_INTEGRACION_NUMERICA/Integracionindex.html",
    color: "#f59e0b",
    colorSuave: "rgba(245, 158, 11, 0.14)"
  },
  {
    numero: 5,
    titulo: "Ecuaciones Diferenciales",
    etiqueta: "MODULO5_EDO",
    escenarios: ["B", "G"],
    descripcion:
      "Modela cambios en el tiempo, como vaciado de reservas, abastecimiento o difusion del descontento social.",
    responsable: "Persona 3 - Ericka Fabiola Barrionuevo Chavez",
    ruta: "MODULO5_EDO/EDOindex.html",
    color: "#ef4444",
    colorSuave: "rgba(239, 68, 68, 0.12)"
  }
];

const escenarios = [
  {
    letra: "A",
    titulo: "Optimizacion de abastecimiento y red de transporte",
    descripcion:
      "Representa la distribucion de productos, combustible o recursos entre diferentes zonas usando sistemas de ecuaciones.",
    modulo: "Modulo 1: Sistemas de Ecuaciones"
  },
  {
    letra: "B",
    titulo: "Vaciado critico de reservas de carburantes",
    descripcion:
      "Analiza como disminuye una reserva con el tiempo y en que momento puede llegar a un nivel critico.",
    modulo: "Modulo 5: Ecuaciones Diferenciales"
  },
  {
    letra: "C",
    titulo: "Desabastecimiento de alimentos y curva de precios",
    descripcion:
      "Estima precios faltantes de productos basicos mediante datos dispersos e interpolacion.",
    modulo: "Modulo 3: Interpolacion"
  },
  {
    letra: "D",
    titulo: "Costo acumulado y perdida del poder adquisitivo familiar",
    descripcion:
      "Calcula el gasto total aproximado durante un periodo usando integracion numerica.",
    modulo: "Modulo 4: Integracion Numerica"
  },
  {
    letra: "E",
    titulo: "Umbrales criticos de abastecimiento",
    descripcion:
      "Busca el punto donde una funcion llega a cero o alcanza un limite critico mediante raices de ecuaciones.",
    modulo: "Modulo 2: Raices de Ecuaciones"
  },
  {
    letra: "F",
    titulo: "Rumores de desabastecimiento y panico en la distribucion",
    descripcion:
      "Modela sistemas sensibles o mal condicionados donde pequenos cambios producen resultados muy diferentes.",
    modulo: "Modulo 1: Sistemas de Ecuaciones"
  },
  {
    letra: "G",
    titulo: "Difusion de opinion o descontento social",
    descripcion:
      "Representa como una opinion, preocupacion o descontento puede cambiar con el tiempo.",
    modulo: "Modulo 5: Ecuaciones Diferenciales"
  }
];

document.addEventListener("DOMContentLoaded", () => {
  renderizarModulos();
  renderizarEscenarios();
});

function renderizarModulos() {
  const contenedor = document.getElementById("modulesGrid");
  contenedor.innerHTML = "";

  modulos.forEach((modulo) => {
    const card = document.createElement("article");
    card.className = "module-card";
    card.style.setProperty("--accent", modulo.color);
    card.style.setProperty("--accent-soft", modulo.colorSuave);

    const tags = modulo.escenarios
      .map((escenario) => `<span class="scenario-tag">Escenario ${escenario}</span>`)
      .join("");

    card.innerHTML = `
      <div class="module-number">${modulo.numero}</div>

      <span class="module-label">${modulo.etiqueta}</span>

      <h3>Modulo ${modulo.numero}: ${modulo.titulo}</h3>

      <p>${modulo.descripcion}</p>

      <div class="scenario-tags">
        ${tags}
      </div>

      <div class="responsable">
        <span>Responsable</span>
        <strong>${modulo.responsable}</strong>
      </div>

      <a href="${modulo.ruta}" class="module-btn">
        Abrir modulo ${modulo.numero}
      </a>
    `;

    contenedor.appendChild(card);
  });
}

function renderizarEscenarios() {
  const contenedor = document.getElementById("scenarioGrid");
  contenedor.innerHTML = "";

  escenarios.forEach((escenario) => {
    const card = document.createElement("article");
    card.className = "scenario-card";
    card.setAttribute("data-letter", escenario.letra);

    card.innerHTML = `
      <h3>Escenario ${escenario.letra}: ${escenario.titulo}</h3>
      <p>${escenario.descripcion}</p>
      <span class="scenario-module">${escenario.modulo}</span>
    `;

    contenedor.appendChild(card);
  });
}