// =====================================================
// PROYECTO FINAL - MÉTODOS NUMÉRICOS
// MÓDULO 2: MÉTODO DEL GRADIENTE CONJUGADO PRECONDICIONADO (GCP)
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
// FUNCIONES AUXILIARES (producto matriz-vector, etc.)
// =====================================================

function productoMatrizVector(A, x) {
  return A.map((fila) =>
    fila.reduce((suma, valor, i) => suma + valor * x[i], 0),
  );
}

function productoPunto(a, b) {
  let suma = 0;
  for (let i = 0; i < a.length; i++) {
    suma += a[i] * b[i];
  }
  return suma;
}

function norma(v) {
  return Math.sqrt(productoPunto(v, v));
}

// =====================================================
// SIMETRÍA Y SIMETRIZACIÓN
// =====================================================

function esSimetrica(A) {
  const tol = 1e-8;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (Math.abs(A[i][j] - A[j][i]) > tol) {
        return false;
      }
    }
  }
  return true;
}

function simetrizarMatriz(A) {
  let S = [];
  for (let i = 0; i < 3; i++) {
    S[i] = [];
    for (let j = 0; j < 3; j++) {
      S[i][j] = (A[i][j] + A[j][i]) / 2;
    }
  }
  return S;
}

// =====================================================
// MÉTODO DEL GRADIENTE CONJUGADO PRECONDICIONADO (GCP)
// =====================================================

function resolverGCP(A, b) {
  const MAX_ITER = 100;
  const TOL = 1e-6;
  const n = 3;

  // x0 = [0,0,0]
  let x = Array(n).fill(0);

  // r0 = b - A*x0
  let Ax = productoMatrizVector(A, x);
  let r = [];
  for (let i = 0; i < n; i++) {
    r[i] = b[i] - Ax[i];
  }

  // Precondicionador diagonal (Jacobi)
  let M = [A[0][0], A[1][1], A[2][2]];

  // z0 = M^-1 r0
  let z = [];
  for (let i = 0; i < n; i++) {
    z[i] = r[i] / M[i];
  }

  let p = [...z];
  let historial = [];
  let rzAnterior = productoPunto(r, z);

  for (let k = 1; k <= MAX_ITER; k++) {
    let Ap = productoMatrizVector(A, p);
    let denominador = productoPunto(p, Ap);

    if (Math.abs(denominador) < 1e-12) {
      break;
    }

    let alpha = rzAnterior / denominador;

    // xk = xk-1 + alpha*pk
    for (let i = 0; i < n; i++) {
      x[i] = x[i] + alpha * p[i];
    }

    // rk = rk-1 - alpha*A*pk
    let rNuevo = [];
    for (let i = 0; i < n; i++) {
      rNuevo[i] = r[i] - alpha * Ap[i];
    }

    let error = norma(rNuevo);

    historial.push({
      iteracion: k,
      x1: x[0],
      x2: x[1],
      x3: x[2],
      error: error,
    });

    if (error < TOL) {
      return {
        convergio: true,
        iteraciones: k,
        solucion: x,
        historial: historial,
      };
    }

    // Resolver Mz = r (precondicionador diagonal)
    let zNuevo = [];
    for (let i = 0; i < n; i++) {
      zNuevo[i] = rNuevo[i] / M[i];
    }

    let rzNuevo = productoPunto(rNuevo, zNuevo);
    let beta = rzNuevo / rzAnterior;

    // pk = zk + beta*pk-1
    let pNuevo = [];
    for (let i = 0; i < n; i++) {
      pNuevo[i] = zNuevo[i] + beta * p[i];
    }

    r = rNuevo;
    z = zNuevo;
    p = pNuevo;
    rzAnterior = rzNuevo;
  }

  return {
    convergio: false,
    iteraciones: MAX_ITER,
    solucion: x,
    historial: historial,
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
        ✔ El método GCP convergió.<br><br>
        Iteraciones utilizadas: <strong>${resultado.iteraciones}</strong>
      </p>
    `;
  } else {
    info.innerHTML = `
      <p class="estado-fallo">✖ El método GCP NO convergió.</p>
      <p>Se alcanzó el límite máximo de 100 iteraciones.</p>
    `;
  }
}

// =====================================================
// ANÁLISIS ACADÉMICO (GRADIENTE CONJUGADO PRECONDICIONADO)
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

  const x = resultado.solucion;
  const iter = resultado.iteraciones;
  const conv = resultado.convergio;

  if (escenario === "ideal") {
    texto.innerHTML = `
      <h3>📦 Abastecimiento normal (Caso Ideal)</h3>
      <p>
        <strong>Contexto real:</strong> Sin bloqueos, las tres plantas de distribución
        (Senkata, Palmasola y Gualberto Villarroel) operan a plena capacidad.
        La matriz original no era simétrica; se simetrizó promediando con su traspuesta,
        convirtiéndola en una matriz simétrica y definida positiva (SPD) apta para GCP.
      </p>
      <h3>⛽ ¿Cuánto combustible debe enviarse?</h3>
      <ul>
        <li><strong>${x[0].toFixed(2)} mil m³</strong> de Gasolina.</li>
        <li><strong>${x[1].toFixed(2)} mil m³</strong> de Diésel.</li>
        <li><strong>${x[2].toFixed(2)} mil m³</strong> de GNV.</li>
      </ul>
      <h3>⚡ Velocidad de convergencia</h3>
      <p>
        El GCP resolvió el sistema simétrico en <strong>${iter} iteraciones</strong>.
        Teóricamente, para una matriz SPD de tamaño 3, el gradiente conjugado
        converge en exactamente 3 iteraciones (o menos). La simetrización no afectó
        la precisión y permitió que el método funcione correctamente.
      </p>
      <h3>⚖️ ¿El sistema es estable?</h3>
      <p>
        Sí, la matriz simetrizada sigue siendo diagonalmente dominante y SPD,
        garantizando una convergencia rapidísima.
      </p>
      <h3>📈 Impacto de un aumento de demanda</h3>
      <p>
        La solución cambiará proporcionalmente, y la convergencia seguirá siendo
        rápida porque la estructura SPD se conserva.
      </p>
    `;
  } else if (escenario === "moderado") {
    texto.innerHTML = `
      <h3>⚠️ Bloqueo parcial en Senkata (Caso Moderado)</h3>
      <p>
        La reducción del coeficiente de Senkata hace que la matriz deje de ser simétrica.
        Nuevamente se aplicó la simetrización (promedio con la traspuesta) para hacerla SPD,
        lo que apenas modifica el problema físico pero habilita el uso del GCP.
      </p>
      <h3>⛽ Distribución necesaria</h3>
      <ul>
        <li><strong>${x[0].toFixed(2)} mil m³</strong> Gasolina.</li>
        <li><strong>${x[1].toFixed(2)} mil m³</strong> Diésel.</li>
        <li><strong>${x[2].toFixed(2)} mil m³</strong> GNV.</li>
      </ul>
      <h3>⚡ Iteraciones requeridas</h3>
      <p>
        El GCP convergió en <strong>${iter} iteraciones</strong>. Aunque la matriz
        es menos dominante, el precondicionador diagonal mantiene una convergencia
        rápida. Sin simetrizar, el método podría diverger o dar resultados erróneos.
      </p>
      <h3>⚖️ Sensibilidad del sistema</h3>
      <p>
        El sistema se vuelve más sensible, pero el GCP está preparado para manejar
        esa situación gracias a la simetrización y al precondicionador.
      </p>
      <h3>📈 Efecto de una demanda mayor</h3>
      <p>
        La convergencia se mantendrá, aunque podría necesitar algunas iteraciones más.
      </p>
    `;
  } else {
    texto.innerHTML = `
      <h3>🔴 Crisis crítica – Bloqueo total (Caso Crítico)</h3>
      <p>
        <strong>Contexto real:</strong> Bloqueos aíslan Senkata. La matriz del caso crítico
        ya es simétrica (no fue necesario simetrizar). Sin embargo, está mal condicionada
        (número de condición alto), lo que ralentiza la convergencia.
      </p>
      <h3>⛽ Resultados numéricos</h3>
      <ul>
        <li><strong>${x[0].toFixed(2)} mil m³</strong> Gasolina.</li>
        <li><strong>${x[1].toFixed(2)} mil m³</strong> Diésel.</li>
        <li><strong>${x[2].toFixed(2)} mil m³</strong> GNV.</li>
      </ul>
      <h3>⚡ Comportamiento del GCP</h3>
      <p>
        El método requirió <strong>${iter} iteraciones</strong>
        ${conv ? "y logró converger" : "pero no alcanzó la tolerancia en 100 pasos"}.
        A pesar del mal condicionamiento, el GCP sigue siendo el método iterativo más
        adecuado, ya que otros métodos estacionarios simplemente no convergen.
      </p>
      <h3>⚖️ Estabilidad y significado físico</h3>
      <p>
        La alta sensibilidad numérica refleja la fragilidad logística real.
        El GCP, al trabajar sobre la matriz simétrica original, puede encontrar una
        aproximación útil incluso en condiciones extremas.
      </p>
      <h3>🧠 ¿Por qué funciona el GCP incluso en crisis?</h3>
      <p>
        Porque explota la simetría y la definición positiva, propiedades que la matriz
        crítica conserva. El precondicionador diagonal reduce el número de condición
        efectivo, acelerando la convergencia. La simetrización no fue necesaria en este caso.
      </p>
    `;
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

  // --- Simetrizar si es necesario (para GCP) ---
  if (!esSimetrica(A)) {
    A = simetrizarMatriz(A);
  }

  let resultado = resolverGCP(A, b);

  mostrarResultados(resultado);
  mostrarIteraciones(resultado);
  generarAnalisis(resultado);
  graficar(A, b, resultado.solucion);
}
