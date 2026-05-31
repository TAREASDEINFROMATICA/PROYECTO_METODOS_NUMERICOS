// =====================================================
// PROYECTO FINAL - MÉTODOS NUMÉRICOS
// MÓDULO 2: MÉTODO DE JACOBI
// Crisis de abastecimiento en Bolivia - 2026
// =====================================================

document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("btn-ideal")
    .addEventListener("click", cargarCasoIdeal);
  document
    .getElementById("btn-moderado")
    .addEventListener("click", cargarCasoModerado);
  document
    .getElementById("btn-critico")
    .addEventListener("click", cargarCasoCritico);
  document
    .getElementById("btn-calcular")
    .addEventListener("click", ejecutarSimulacion);
  ejecutarSimulacion();
});

// =====================================================
// ESCENARIOS
// =====================================================

function activarBoton(idActivo) {
  ["btn-ideal", "btn-moderado", "btn-critico"].forEach((id) => {
    document.getElementById(id).classList.remove("active");
  });
  document.getElementById(idActivo).classList.add("active");
}

function configurarSistema(datos) {
  document.getElementById("a11").value = datos[0][0];
  document.getElementById("a12").value = datos[0][1];
  document.getElementById("a13").value = datos[0][2];
  document.getElementById("b1").value = datos[0][3];

  document.getElementById("a21").value = datos[1][0];
  document.getElementById("a22").value = datos[1][1];
  document.getElementById("a23").value = datos[1][2];
  document.getElementById("b2").value = datos[1][3];

  document.getElementById("a31").value = datos[2][0];
  document.getElementById("a32").value = datos[2][1];
  document.getElementById("a33").value = datos[2][2];
  document.getElementById("b3").value = datos[2][3];
}

function cargarCasoIdeal() {
  activarBoton("btn-ideal");
  configurarSistema([
    [5, 1, 1, 23],
    [1, 4, 1, 24],
    [2, 1, 6, 31],
  ]);
  ejecutarSimulacion();
}

function cargarCasoModerado() {
  activarBoton("btn-moderado");
  configurarSistema([
    [2, 1, 1, 14],
    [1, 4, 1, 24],
    [2, 1, 6, 31],
  ]);
  ejecutarSimulacion();
}

function cargarCasoCritico() {
  activarBoton("btn-critico");
  configurarSistema([
    [1.0, 0.99, 0.98, 2.97],
    [0.99, 1.0, 0.99, 2.98],
    [0.98, 0.99, 1.0, 2.97],
  ]);
  ejecutarSimulacion();
}

// =====================================================
// LECTURA DE LA MATRIZ Y VECTOR
// =====================================================

function obtenerMatrizA() {
  return [
    [
      parseFloat(document.getElementById("a11").value),
      parseFloat(document.getElementById("a12").value),
      parseFloat(document.getElementById("a13").value),
    ],
    [
      parseFloat(document.getElementById("a21").value),
      parseFloat(document.getElementById("a22").value),
      parseFloat(document.getElementById("a23").value),
    ],
    [
      parseFloat(document.getElementById("a31").value),
      parseFloat(document.getElementById("a32").value),
      parseFloat(document.getElementById("a33").value),
    ],
  ];
}

function obtenerVectorB() {
  return [
    parseFloat(document.getElementById("b1").value),
    parseFloat(document.getElementById("b2").value),
    parseFloat(document.getElementById("b3").value),
  ];
}

// =====================================================
// MÉTODO DE GAUSS-SEIDEL
// =====================================================

function resolverGaussSeidel(A, b) {
  const tolerancia = 0.00001;

  const maxIter = 100;

  let x = [0, 0, 0];

  let historial = [];

  let convergio = false;

  let iteraciones = 0;

  for (let k = 1; k <= maxIter; k++) {
    let anterior = [...x];

    // x1 usa valores anteriores
    x[0] = (b[0] - A[0][1] * x[1] - A[0][2] * x[2]) / A[0][0];

    // x2 usa el nuevo x1
    x[1] = (b[1] - A[1][0] * x[0] - A[1][2] * x[2]) / A[1][1];

    // x3 usa el nuevo x1 y x2
    x[2] = (b[2] - A[2][0] * x[0] - A[2][1] * x[1]) / A[2][2];

    let error = Math.max(
      Math.abs(x[0] - anterior[0]),

      Math.abs(x[1] - anterior[1]),

      Math.abs(x[2] - anterior[2]),
    );

    historial.push({
      iteracion: k,

      x1: x[0],

      x2: x[1],

      x3: x[2],

      error: error,
    });

    if (error < tolerancia) {
      convergio = true;

      iteraciones = k;

      break;
    }
  }

  if (!convergio) {
    iteraciones = maxIter;
  }

  return {
    solucion: x,

    historial: historial,

    convergio: convergio,

    iteraciones: iteraciones,
  };
}

// =====================================================
// MOSTRAR RESULTADOS
// =====================================================

function mostrarResultados(resultado) {
  let x = resultado.solucion;
  document.getElementById("solucion-output").innerHTML = `
    <div class="solucion-item">
        ⛽ Gasolina (x₁):
        <span>${x[0].toFixed(4)}</span> mil m³
    </div>
    <div class="solucion-item">
        🚛 Diésel (x₂):
        <span>${x[1].toFixed(4)}</span> mil m³
    </div>
    <div class="solucion-item">
        🔥 GNV (x₃):
        <span>${x[2].toFixed(4)}</span> mil m³
    </div>
  `;
}

// =====================================================
// MOSTRAR TABLA DE ITERACIONES
// =====================================================

function mostrarIteraciones(resultado) {
  let tbody = document.querySelector("#tabla-iteraciones tbody");
  tbody.innerHTML = "";

  resultado.historial.forEach((fila) => {
    tbody.innerHTML += `
      <tr>
        <td>${fila.iteracion}</td>
        <td>${fila.x1.toFixed(4)}</td>
        <td>${fila.x2.toFixed(4)}</td>
        <td>${fila.x3.toFixed(4)}</td>
        <td>${fila.error.toExponential(2)}</td>
      </tr>
    `;
  });

  let info = document.getElementById("info-iteraciones");
  if (resultado.convergio) {
    info.innerHTML = `
      <p class="estado-convergio">
        ✔ El método convergió.<br><br>
        Iteraciones utilizadas: <strong>${resultado.iteraciones}</strong>
      </p>
    `;
  } else {
    info.innerHTML = `
      <p class="estado-fallo">✖ El método NO convergió.</p>
      <p>Se alcanzó el límite máximo de 100 iteraciones.</p>
    `;
  }
}

// =====================================================
// ANÁLISIS ACADÉMICO (COMPLETO Y DETALLADO)
// =====================================================

function generarAnalisis(resultado) {
  let texto = document.getElementById("analisis-texto");
  let escenario = "";

  if (document.getElementById("btn-ideal").classList.contains("active")) {
    escenario = "ideal";
  } else if (
    document.getElementById("btn-moderado").classList.contains("active")
  ) {
    escenario = "moderado";
  } else {
    escenario = "critico";
  }

  if (escenario === "ideal") {
    texto.innerHTML = `
      <h3>¿Cuánto debe enviarse a cada zona?</h3>
      <p>
        Para satisfacer la demanda de la ciudad en condiciones normales
        se requiere distribuir aproximadamente:
      </p>
      <ul>
        <li><strong>${resultado.solucion[0].toFixed(2)} mil m³</strong> de Gasolina.</li>
        <li><strong>${resultado.solucion[1].toFixed(2)} mil m³</strong> de Diésel.</li>
        <li><strong>${resultado.solucion[2].toFixed(2)} mil m³</strong> de GNV.</li>
      </ul>
      <h3>¿Qué pasa si una ruta se bloquea?</h3>
      <p>
        En este escenario no existen bloqueos.
        Las plantas Senkata (El Alto),
        Palmasola (Santa Cruz)
        y Gualberto Villarroel (Cochabamba)
        operan normalmente.
      </p>
      <h3>¿Qué zona queda más afectada?</h3>
      <p>
        Ninguna zona resulta afectada porque el abastecimiento
        es suficiente para cubrir la demanda.
      </p>
      <h3>¿El sistema es estable o sensible?</h3>
      <p>
        El sistema es estable porque la matriz es
        estrictamente dominante por diagonales.
      </p>
      <p>
        Por esta razón Gauss-Seidel converge rápidamente.
      </p>
      <h3>¿Qué pasa si aumenta la demanda?</h3>
      <p>
        La solución aumentará de forma proporcional
        sin comprometer la estabilidad matemática.
      </p>
    `;
  } else if (escenario === "moderado") {
    texto.innerHTML = `
      <h3>¿Qué pasa si una ruta se bloquea?</h3>
      <p>
        Se simula un bloqueo importante en la ruta de acceso
        a la Planta Senkata.
      </p>
      <p>
        La capacidad de distribución de combustible
        disminuye considerablemente.
      </p>
      <h3>¿Qué zona queda más afectada?</h3>
      <p>
        La Zona Norte es la más afectada debido a que depende
        principalmente del combustible enviado desde Senkata.
      </p>
      <p>
        Las plantas Palmasola y Gualberto Villarroel deben
        compensar parte de la distribución.
      </p>
      <h3>¿Cuánto debe enviarse?</h3>
      <ul>
        <li><strong>${resultado.solucion[0].toFixed(2)} mil m³</strong> Gasolina.</li>
        <li><strong>${resultado.solucion[1].toFixed(2)} mil m³</strong> Diésel.</li>
        <li><strong>${resultado.solucion[2].toFixed(2)} mil m³</strong> GNV.</li>
      </ul>
      <h3>¿El sistema es estable o sensible?</h3>
      <p>
        El sistema se vuelve más sensible debido a la pérdida
        de dominancia diagonal.
      </p>
      <p>
        El método de Gauss-Seidel requiere más iteraciones
        para alcanzar la convergencia.
      </p>
      <h3>¿Qué pasa si aumenta la demanda?</h3>
      <p>
        La presión sobre las plantas restantes aumenta,
        incrementando el riesgo de desabastecimiento.
      </p>
    `;
  } else {
    // Caso III - Crisis Crítica
    texto.innerHTML = `
      <h3>Escenario de Crisis Crítica Nacional</h3>
      <p>
        Este escenario representa una situación extrema
        similar a la crisis de abastecimiento registrada
        durante los bloqueos de 2026.
      </p>
      <p>
        Las ciudades de La Paz y El Alto quedan prácticamente
        aisladas debido a múltiples puntos de bloqueo en las
        carreteras nacionales.
      </p>
      <p>
        Los accesos hacia la Planta Senkata se encuentran
        seriamente restringidos y el transporte de combustible
        desde otras regiones presenta retrasos significativos.
      </p>
      <h3>¿Qué pasa si las carreteras quedan bloqueadas?</h3>
      <p>
        La coordinación logística entre Senkata,
        Palmasola y Gualberto Villarroel se vuelve
        extremadamente difícil.
      </p>
      <p>
        La distribución de combustible deja de ser eficiente
        y comienzan los riesgos de desabastecimiento.
      </p>
      <h3>¿Qué zona queda más afectada?</h3>
      <p>
        La Zona Norte y gran parte de El Alto son las más
        afectadas debido a su cercanía y dependencia
        de la Planta Senkata.
      </p>
      <h3>¿El sistema es estable o sensible?</h3>
      <p>
        No.
      </p>
      <p>
        La matriz utilizada es mal condicionada.
      </p>
      <p>
        Pequeñas variaciones en la demanda pueden provocar
        grandes cambios en la solución matemática.
      </p>
      <h3>¿Por qué Gauss-Seidel presenta dificultades?</h3>
      <p>
        Gauss-Seidel funciona mejor cuando existe dominancia diagonal.
      </p>
      <p>
        Al perderse esa condición debido al colapso logístico,
        el método necesita muchas iteraciones e incluso puede
        no converger dentro del límite de 100 iteraciones.
      </p>
      <h3>¿Qué pasa si aumenta la demanda?</h3>
      <p>
        Un pequeño incremento en la demanda puede producir
        cambios muy grandes en los resultados,
        evidenciando una red altamente sensible e inestable.
      </p>
    `;

    // Mensaje adicional según convergencia
    if (!resultado.convergio) {
      texto.innerHTML += `
        <h3>Resultado del Método</h3>
        <p style="color:red;font-weight:bold;">
          El método de Gauss-Seidel no logró converger dentro
          del límite de 100 iteraciones.
        </p>
        <p>
          Este comportamiento confirma que las matrices
          mal condicionadas representan un desafío para
          los métodos iterativos clásicos.
        </p>
      `;
    } else {
      texto.innerHTML += `
        <h3>Resultado del Método</h3>
        <p style="color:green;font-weight:bold;">
          El método logró converger, pero requirió
          un esfuerzo computacional considerablemente mayor.
        </p>
      `;
    }
  }
}

// =====================================================
// GRÁFICO 3D
// =====================================================

function graficar(A, b, xsol) {
  let rangoX = [];
  let rangoY = [];
  for (let i = 0; i <= 8; i += 0.5) {
    rangoX.push(i);
    rangoY.push(i);
  }

  let data = [];
  let colores = [
    "rgba(52,152,219,0.5)",
    "rgba(46,204,113,0.5)",
    "rgba(241,196,15,0.5)",
  ];
  let nombres = [
    "Planta Senkata",
    "Planta Palmasola",
    "Planta Gualberto Villarroel",
  ];

  for (let k = 0; k < 3; k++) {
    if (Math.abs(A[k][2]) < 0.00001) continue;

    let zMatrix = [];
    for (let i = 0; i < rangoX.length; i++) {
      let fila = [];
      for (let j = 0; j < rangoY.length; j++) {
        let x = rangoX[i];
        let y = rangoY[j];
        let z = (b[k] - A[k][0] * x - A[k][1] * y) / A[k][2];
        fila.push(z);
      }
      zMatrix.push(fila);
    }

    data.push({
      x: rangoX,
      y: rangoY,
      z: zMatrix,
      type: "surface",
      opacity: 0.65,
      showscale: false,
      name: nombres[k],
      colorscale: [
        [0, colores[k]],
        [1, colores[k]],
      ],
    });
  }

  data.push({
    x: [xsol[0]],
    y: [xsol[1]],
    z: [xsol[2]],
    mode: "markers",
    type: "scatter3d",
    marker: { color: "red", size: 8 },
    name: "Punto de Equilibrio",
  });

  let layout = {
    title: "Intersección de los Planos del Sistema",
    scene: {
      xaxis: { title: "Gasolina (x₁)" },
      yaxis: { title: "Diésel (x₂)" },
      zaxis: { title: "GNV (x₃)" },
    },
    margin: { l: 0, r: 0, b: 0, t: 40 },
  };

  Plotly.newPlot("plotly-chart", data, layout);
}

// =====================================================
// PRINCIPAL
// =====================================================

function ejecutarSimulacion() {
  let A = obtenerMatrizA();
  let b = obtenerVectorB();
  let resultado = resolverGaussSeidel(A, b); // <-- CORREGIDO AQUÍ

  mostrarResultados(resultado);
  mostrarIteraciones(resultado);
  generarAnalisis(resultado);
  graficar(A, b, resultado.solucion);
}
