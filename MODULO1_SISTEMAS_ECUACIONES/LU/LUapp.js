// =====================================================
// PROYECTO FINAL - MÉTODOS NUMÉRICOS
// MÓDULO 1: FACTORIZACIÓN LU (DOOLITTLE)
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
  cargarCasoIdeal();
});

// =====================================================
// ESCENARIOS
// =====================================================

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
    [1, 0.9, 0.8, 2.7],
    [0.9, 1, 0.9, 2.8],
    [0.8, 0.9, 1, 2.7],
  ]);
  ejecutarSimulacion();
}

// =====================================================
// BOTONES
// =====================================================

function activarBoton(idActivo) {
  document.getElementById("btn-ideal").classList.remove("active");
  document.getElementById("btn-moderado").classList.remove("active");
  document.getElementById("btn-critico").classList.remove("active");
  document.getElementById(idActivo).classList.add("active");
}

// =====================================================
// MATRIZ
// =====================================================

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
// FACTORIZACIÓN LU DOOLITTLE
// =====================================================

function resolverLU(A, b) {
  const n = 3;
  let L = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ];
  let U = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];

  for (let i = 0; i < n; i++) {
    for (let k = i; k < n; k++) {
      let suma = 0;
      for (let j = 0; j < i; j++) {
        suma += L[i][j] * U[j][k];
      }
      U[i][k] = A[i][k] - suma;
    }
    for (let k = i + 1; k < n; k++) {
      let suma = 0;
      for (let j = 0; j < i; j++) {
        suma += L[k][j] * U[j][i];
      }
      if (U[i][i] === 0) {
        return null;
      }
      L[k][i] = (A[k][i] - suma) / U[i][i];
    }
  }

  // Sustitución hacia adelante (Ly = b)
  let y = [0, 0, 0];
  for (let i = 0; i < n; i++) {
    let suma = 0;
    for (let j = 0; j < i; j++) {
      suma += L[i][j] * y[j];
    }
    y[i] = b[i] - suma;
  }

  // Sustitución hacia atrás (Ux = y)
  let x = [0, 0, 0];
  for (let i = n - 1; i >= 0; i--) {
    let suma = 0;
    for (let j = i + 1; j < n; j++) {
      suma += U[i][j] * x[j];
    }
    x[i] = (y[i] - suma) / U[i][i];
  }

  return { L, U, x };
}

// =====================================================
// DIAGNÓSTICO NUMÉRICO
// =====================================================

function evaluarEstabilidad(A) {
  let dominante = true;
  for (let i = 0; i < 3; i++) {
    let suma = 0;
    for (let j = 0; j < 3; j++) {
      if (i !== j) suma += Math.abs(A[i][j]);
    }
    if (Math.abs(A[i][i]) <= suma) {
      dominante = false;
    }
  }
  return dominante;
}

// =====================================================
// MOSTRAR ESTADO DEL SISTEMA
// =====================================================

function mostrarEstado(A) {
  let estado = document.getElementById("estado-sistema");
  let dominante = evaluarEstabilidad(A);

  if (dominante) {
    estado.innerHTML = `
      <p class="estado-ok">✔ Sistema estable</p>
      <p>La matriz es estrictamente dominante por diagonales.</p>
      <p>Ideal para LU, Jacobi, Gauss-Seidel y SOR.</p>
    `;
  } else {
    estado.innerHTML = `
      <p class="estado-danger">⚠ Sistema sensible</p>
      <p>La matriz no es dominante por diagonales.</p>
      <p>Los métodos iterativos pueden degradarse o divergir.</p>
    `;
  }
}

// =====================================================
// PRINCIPAL (con las funciones de presentación)
// =====================================================

function ejecutarSimulacion() {
  const A = obtenerMatrizA();
  const b = obtenerVectorB();
  const resultado = resolverLU(A, b);

  if (resultado === null) {
    alert("No se puede realizar la factorización LU.");
    return;
  }

  // ----- Mostrar resultados (con panel de significado de variables) -----
  function mostrarResultados(resultado) {
    let div = document.getElementById("solucion-output");
    div.innerHTML = `
      <div class="solucion-item">
          ⛽ Gasolina (x₁):
          <span>${resultado.x[0].toFixed(2)}</span> mil m³
      </div>
      <div class="solucion-item">
          🚛 Diésel Oíl (x₂):
          <span>${resultado.x[1].toFixed(2)}</span> mil m³
      </div>
      <div class="solucion-item">
          🔥 GNV (x₃):
          <span>${resultado.x[2].toFixed(2)}</span> mil m³
      </div>

      <div class="info-plantas">
        <p><strong>x₁:</strong> Gasolina enviada desde las plantas distribuidoras.</p>
        <p><strong>x₂:</strong> Diésel enviado desde las plantas distribuidoras.</p>
        <p><strong>x₃:</strong> GNV enviado desde las plantas distribuidoras.</p>
      </div>

      <hr>
      <p><strong>Interpretación:</strong> Estos valores representan la cantidad óptima de combustible que
      debe distribuirse desde las plantas de abastecimiento para cubrir la demanda urbana bajo el escenario seleccionado.</p>
    `;

    document.getElementById("matriz-l").innerHTML = resultado.L.map(
      (fila) => "[ " + fila.map((v) => v.toFixed(4)).join("  ") + " ]",
    ).join("<br>");

    document.getElementById("matriz-u").innerHTML = resultado.U.map(
      (fila) => "[ " + fila.map((v) => v.toFixed(4)).join("  ") + " ]",
    ).join("<br>");
  }

  // ----- Análisis académico (con el else modificado) -----
  function generarAnalisis(x) {
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
        <p>Deben distribuirse <strong>${x[0].toFixed(2)}</strong> mil m³ de gasolina,
        <strong>${x[1].toFixed(2)}</strong> mil m³ de diésel y
        <strong>${x[2].toFixed(2)}</strong> mil m³ de GNV.</p>
        <h3>¿Qué pasa si una ruta se bloquea?</h3>
        <p>Actualmente no existen bloqueos y la red funciona normalmente.</p>
        <h3>¿Qué zona queda más afectada?</h3>
        <p>Ninguna zona presenta déficit de abastecimiento.</p>
        <h3>¿El sistema es estable?</h3>
        <p>Sí. La matriz es diagonalmente dominante.</p>
        <h3>¿Qué pasa si aumenta la demanda?</h3>
        <p>La solución cambia proporcionalmente manteniendo estabilidad.</p>
      `;
    } else if (escenario === "moderado") {
      texto.innerHTML = `
        <h3>Impacto del bloqueo parcial</h3>
        <p>La capacidad de Senkata disminuye significativamente.</p>
        <p>La Planta Palmasola debe compensar parte del abastecimiento.</p>
        <p>El sistema se vuelve más sensible a perturbaciones.</p>
      `;
    } else {
      // Caso III - Crisis Crítica (nuevo contenido)
      texto.innerHTML = `
        <h3>¿Qué representa este escenario?</h3>
        <p>
          Este escenario simula una situación extrema de crisis logística en Bolivia,
          donde múltiples carreteras nacionales se encuentran bloqueadas y las rutas
          de acceso hacia La Paz y El Alto están severamente restringidas.
        </p>
        <p>
          Las plantas distribuidoras de combustible no pueden coordinar de manera
          eficiente sus envíos debido a la interrupción simultánea de varias rutas
          estratégicas.
        </p>

        <h3>¿Qué plantas participan?</h3>
        <p>
          ⛽ <strong>Planta Senkata (El Alto)</strong><br>
          🚛 <strong>Planta Palmasola (Santa Cruz)</strong><br>
          🔥 <strong>Planta Gualberto Villarroel (Cochabamba)</strong>
        </p>
        <p>
          Estas tres plantas intentan abastecer las zonas Norte, Centro y Sur de la ciudad,
          pero la capacidad de transporte se encuentra seriamente afectada.
        </p>

        <h3>¿Qué ocurre matemáticamente?</h3>
        <p>
          La matriz del sistema se vuelve mal condicionada.
          Esto significa que pequeñas variaciones en la demanda o en la capacidad de transporte
          pueden provocar cambios muy grandes en la solución obtenida.
        </p>

        <h3>¿Qué significa para el abastecimiento?</h3>
        <p>
          La red de distribución pierde estabilidad.
          Las plantas no logran compensar adecuadamente las restricciones de transporte,
          provocando riesgos de desabastecimiento de gasolina, diésel y GNV en varias zonas
          de la ciudad.
        </p>

        <h3>¿Por qué es importante este escenario?</h3>
        <p>
          Este caso permite analizar cómo reaccionan los métodos numéricos cuando el sistema
          de ecuaciones se vuelve altamente sensible. Es especialmente útil para comparar el
          comportamiento de LU, Jacobi, Gauss-Seidel, SOR y posteriormente el método de
          Gradiente Conjugado Precondicionado.
        </p>
      `;
    }
  }

  // ----- Gráfico 3D -----
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
      title: "Intersección Geométrica de los Planos",
      scene: {
        xaxis: { title: "Gasolina (x₁)" },
        yaxis: { title: "Diésel (x₂)" },
        zaxis: { title: "GNV (x₃)" },
      },
      margin: { l: 0, r: 0, b: 0, t: 40 },
    };

    Plotly.newPlot("plotly-chart", data, layout);
  }

  // ============ LLAMADAS FINALES ============
  mostrarEstado(A);
  mostrarResultados(resultado);
  generarAnalisis(resultado.x);
  graficar(A, b, resultado.x);
}
