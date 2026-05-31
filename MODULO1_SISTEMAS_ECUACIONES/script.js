// ========== SOLVERS ==========

// Jacobi
function resolverJacobi(A, b, tol = 1e-5, maxIter = 100) {
  const n = b.length;
  let x = Array(n).fill(0);
  let iter = 0;
  for (let k = 1; k <= maxIter; k++) {
    let anterior = [...x];
    let xNuevo = [];
    for (let i = 0; i < n; i++) {
      let suma = b[i];
      for (let j = 0; j < n; j++) if (j !== i) suma -= A[i][j] * anterior[j];
      xNuevo[i] = suma / A[i][i];
    }
    let error = Math.max(...xNuevo.map((v, i) => Math.abs(v - x[i])));
    x = xNuevo;
    iter = k;
    if (error < tol) return { solucion: x, iteraciones: k, convergio: true };
    if (!isFinite(error) || error > 1e12) break;
  }
  return { solucion: x, iteraciones: iter, convergio: false };
}

// Gauss-Seidel
function resolverGaussSeidel(A, b, tol = 1e-5, maxIter = 100) {
  const n = b.length;
  let x = Array(n).fill(0);
  let iter = 0;
  for (let k = 1; k <= maxIter; k++) {
    let anterior = [...x];
    for (let i = 0; i < n; i++) {
      let suma = b[i];
      for (let j = 0; j < n; j++) if (j !== i) suma -= A[i][j] * x[j];
      x[i] = suma / A[i][i];
    }
    let error = Math.max(...x.map((v, i) => Math.abs(v - anterior[i])));
    iter = k;
    if (error < tol) return { solucion: x, iteraciones: k, convergio: true };
    if (!isFinite(error) || error > 1e12) break;
  }
  return { solucion: x, iteraciones: iter, convergio: false };
}

// SOR con omega por defecto 1.03 (ahora fijo)
function resolverSOR(A, b, omega = 1.03, tol = 1e-5, maxIter = 100) {
  const n = b.length;
  let x = Array(n).fill(0);
  let iter = 0;
  for (let k = 1; k <= maxIter; k++) {
    let anterior = [...x];
    for (let i = 0; i < n; i++) {
      let suma = b[i];
      for (let j = 0; j < n; j++) if (j !== i) suma -= A[i][j] * x[j];
      let xgs = suma / A[i][i];
      x[i] = (1 - omega) * x[i] + omega * xgs;
    }
    let error = Math.max(...x.map((v, i) => Math.abs(v - anterior[i])));
    iter = k;
    if (error < tol) return { solucion: x, iteraciones: k, convergio: true };
    if (!isFinite(error) || error > 1e12) break;
  }
  return { solucion: x, iteraciones: iter, convergio: false };
}

// Gradiente Conjugado Precondicionado
function productoMatrizVector(A, x) {
  return A.map((row) => row.reduce((s, v, i) => s + v * x[i], 0));
}
function productoPunto(a, b) {
  return a.reduce((s, v, i) => s + v * b[i], 0);
}
function esSimetrica(A, tol = 1e-8) {
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      if (Math.abs(A[i][j] - A[j][i]) > tol) return false;
  return true;
}
function simetrizarMatriz(A) {
  return A.map((row, i) => row.map((val, j) => (val + A[j][i]) / 2));
}
function resolverGCP(A, b, tol = 1e-6, maxIter = 100) {
  if (!esSimetrica(A)) A = simetrizarMatriz(A);
  const n = 3;
  let x = Array(n).fill(0);
  let r = b.map((bi, i) => bi - productoMatrizVector(A, x)[i]);
  let M = [A[0][0], A[1][1], A[2][2]];
  let z = r.map((ri, i) => ri / M[i]);
  let p = [...z];
  let rzAnterior = productoPunto(r, z);
  for (let k = 1; k <= maxIter; k++) {
    let Ap = productoMatrizVector(A, p);
    let denom = productoPunto(p, Ap);
    if (Math.abs(denom) < 1e-12) break;
    let alpha = rzAnterior / denom;
    x = x.map((xi, i) => xi + alpha * p[i]);
    let rNuevo = r.map((ri, i) => ri - alpha * Ap[i]);
    let error = Math.sqrt(productoPunto(rNuevo, rNuevo));
    if (error < tol) return { solucion: x, iteraciones: k, convergio: true };
    let zNuevo = rNuevo.map((ri, i) => ri / M[i]);
    let rzNuevo = productoPunto(rNuevo, zNuevo);
    let beta = rzNuevo / rzAnterior;
    p = zNuevo.map((zi, i) => zi + beta * p[i]);
    r = rNuevo;
    z = zNuevo;
    rzAnterior = rzNuevo;
  }
  return { solucion: x, iteraciones: maxIter, convergio: false };
}

// Factorización LU (Doolittle)
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
      for (let j = 0; j < i; j++) suma += L[i][j] * U[j][k];
      U[i][k] = A[i][k] - suma;
    }
    for (let k = i + 1; k < n; k++) {
      let suma = 0;
      for (let j = 0; j < i; j++) suma += L[k][j] * U[j][i];
      if (Math.abs(U[i][i]) < 1e-12) return null;
      L[k][i] = (A[k][i] - suma) / U[i][i];
    }
  }
  // Sustitución hacia adelante (Ly = b)
  let y = [0, 0, 0];
  for (let i = 0; i < n; i++) {
    let suma = 0;
    for (let j = 0; j < i; j++) suma += L[i][j] * y[j];
    y[i] = b[i] - suma;
  }
  // Sustitución hacia atrás (Ux = y)
  let x = [0, 0, 0];
  for (let i = n - 1; i >= 0; i--) {
    let suma = 0;
    for (let j = i + 1; j < n; j++) suma += U[i][j] * x[j];
    x[i] = (y[i] - suma) / U[i][i];
  }
  return { L, U, x };
}

// ========== DATOS DE ESCENARIOS ==========
const scenarios = [
  {
    A: [
      [5, 1, 1],
      [1, 4, 1],
      [2, 1, 6],
    ],
    b: [23, 24, 31],
  },
  {
    A: [
      [2, 1, 1],
      [1, 4, 1],
      [2, 1, 6],
    ],
    b: [14, 24, 31],
  },
  {
    A: [
      [1.0, 0.99, 0.98],
      [0.99, 1.0, 0.99],
      [0.98, 0.99, 1.0],
    ],
    b: [2.97, 2.98, 2.97],
  },
];

// ========== CAMBIO DE ESCENARIO ==========
function switchScenario(idx) {
  document
    .querySelectorAll(".scenario-tab")
    .forEach((tab, i) => tab.classList.toggle("active", i === idx));
  document
    .querySelectorAll(".scenario-content")
    .forEach((cont, i) => cont.classList.toggle("active", i === idx));
}

// ========== EJECUTAR COMPARACIÓN Y ANÁLISIS LU ==========
function runComparison() {
  const sc = parseInt(document.getElementById("compScenario").value);
  const { A, b } = scenarios[sc];

  const methods = [
    { name: "Jacobi", fn: () => resolverJacobi(A, b) },
    { name: "Gauss‑Seidel", fn: () => resolverGaussSeidel(A, b) },
    { name: "SOR (ω=1.03)", fn: () => resolverSOR(A, b, 1.03) },
    { name: "Gradiente Conjugado", fn: () => resolverGCP(A, b) },
    {
      name: "LU (Directo)",
      fn: () => {
        const lu = resolverLU(A, b);
        if (!lu)
          return {
            solucion: [NaN, NaN, NaN],
            iteraciones: 0,
            convergio: true,
            L: null,
            U: null,
          };
        return {
          solucion: lu.x,
          iteraciones: 1,
          convergio: true,
          L: lu.L,
          U: lu.U,
        };
      },
    },
  ];

  // Llenar tabla comparativa
  let html = "";
  methods.forEach((m) => {
    const res = m.fn();
    const x = res.solucion;
    html += `<tr>
      <td style="text-align:left;font-weight:600">${m.name}</td>
      <td>${res.iteraciones}</td>
      <td class="${res.convergio ? "converged" : "diverged"}">${res.convergio ? "✔" : "✖"}</td>
      <td>${isFinite(x[0]) ? x[0].toFixed(4) : "∞"}</td>
      <td>${isFinite(x[1]) ? x[1].toFixed(4) : "∞"}</td>
      <td>${isFinite(x[2]) ? x[2].toFixed(4) : "∞"}</td>
    </tr>`;
  });
  document.getElementById("comparisonBody").innerHTML = html;

  // Análisis LU
  const luResult = resolverLU(A, b);
  const luCard = document.getElementById("luCard");
  if (luResult) {
    const { L, U, x } = luResult;
    // Mostrar matrices
    document.getElementById("matrizL").innerHTML = L.map(
      (fila) => `[ ${fila.map((v) => v.toFixed(4)).join("  ")} ]`,
    ).join("<br>");
    document.getElementById("matrizU").innerHTML = U.map(
      (fila) => `[ ${fila.map((v) => v.toFixed(4)).join("  ")} ]`,
    ).join("<br>");

    // Análisis académico (adaptado de tu LUapp.js)
    let analisis = "";
    if (sc === 0) {
      analisis = `
        <p><strong>Caso Ideal:</strong> La factorización LU se realiza sin problemas. La matriz es estrictamente diagonal dominante, lo que garantiza estabilidad numérica. La solución exacta indica las cantidades óptimas de combustible: <strong>${x[0].toFixed(2)}</strong> mil m³ de gasolina, <strong>${x[1].toFixed(2)}</strong> mil m³ de diésel y <strong>${x[2].toFixed(2)}</strong> mil m³ de GNV.</p>
        <p>El sistema es estable y las rutas de distribución operan normalmente.</p>
      `;
    } else if (sc === 1) {
      analisis = `
        <p><strong>Caso Moderado:</strong> Con la capacidad de Senkata reducida, la matriz pierde algo de dominancia diagonal, pero la factorización LU sigue siendo posible y exacta. Los valores obtenidos reflejan la necesidad de redistribuir el envío de combustibles, apoyándose más en Palmasola y Villarroel.</p>
      `;
    } else {
      analisis = `
        <p><strong>Caso Crítico:</strong> La matriz está mal condicionada (coeficientes casi iguales). Aunque LU puede resolver el sistema matemáticamente, pequeños errores de redondeo pueden afectar la precisión. La solución muestra una concentración extrema en un solo combustible, lo que evidencia la fragilidad de la red logística bajo bloqueos totales.</p>
        <p>Este escenario demuestra que incluso el método directo LU revela la inestabilidad del sistema: la matriz es casi singular y la solución es altamente sensible a perturbaciones.</p>
      `;
    }
    document.getElementById("analisisLU").innerHTML = analisis;
    luCard.style.display = "block";
  } else {
    luCard.style.display = "none";
  }
}

// Ejecutar al cargar
window.addEventListener("load", () => {
  runComparison();
});
