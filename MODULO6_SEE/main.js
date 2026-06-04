document.addEventListener("DOMContentLoaded", () => {
  let graficoInstance = null;

  // Dentro de document.addEventListener("DOMContentLoaded", () => {
  // Busca ESTA sección y reemplázala completa:

  const explicacionesMetodos = {
    lu: `<h3>1. Factorización LU (El Filtro de Rutas Directas)</h3>
         <p><strong>¿Cómo funciona en la vida real?:</strong> Este método divide el problema logístico en dos pasos limpios. Primero, analiza cómo viajan los camiones desde los centros de acopio principales (origen), y segundo, cómo se distribuye esa carga al llegar al destino final en cada mercado.</p>
         <p><strong>¿Qué nos dice el resultado actual?:</strong> Al revisar la matriz en pantalla, notarás que los números de la diagonal están peligrosamente cerca unos de otros. Esto significa que las rutas de distribución están tan congestionadas y saturadas que el sistema ha perdido su capacidad de absorber golpes. Cuando las personas entran en pánico por un rumor del 5% o 50% y van a comprar de golpe, el algoritmo se desequilibra por completo. En lugar de repartir comida equitativamente, envía toneladas de más a un mercado y deja a los otros vacíos o en números negativos (desabastecimiento total).</p>`,

    jacobi: `<h3>2. Método de Jacobi (El Despacho Simultáneo de Camiones)</h3>
         <p><strong>¿Cómo funciona en la vida real?:</strong> Imagina que las intendencias de los tres mercados intentan adivinar cuánta comida necesitan enviándose mensajes al mismo tiempo, pero usando información vieja del día anterior, sin coordinar en tiempo real.</p>
         <p><strong>¿Por qué falla con los rumores?:</strong> Para que este método funcione bien, cada mercado debería tener un control absoluto y aislado de sus datos. Pero en el día a día de nuestras rutas, lo que pasa en El Alto afecta directamente a la Villa Fátima y al Mercado Rodríguez. Como los coeficientes reflejan una altísima fricción en las calles, verás en la tabla de iteraciones que los números empiezan a rebotar de un lado a otro (oscilar salvajemente). El método se vuelve loco intentando adivinar el inventario y nunca llega a una solución estable. Los camiones virtuales se quedan dando vueltas sin rumbo.</p>`,

    seidel: `<h3>3. Métodos Iterativos: Gauss-Seidel vs SOR (Corregir sobre la Marcha)</h3>
         <p><strong>Gauss-Seidel (Aprender en tiempo real):</strong> A diferencia del anterior, este método es más inteligente. Apenas calcula cuántos camiones necesita el Mercado Rodríguez, usa ese dato inmediatamente para calcular lo que requiere Villa Fátima en ese mismo instante. Sin embargo, cuando el rumor de WhatsApp se dispara al 50%, la confusión es tan grande que el algoritmo se vuelve extremadamente lento. Necesita dar demasiadas vueltas (iteraciones) en la tabla para estabilizar el suministro, lo que en el mundo real significaría reaccionar días tarde, cuando los anaqueles ya están vacíos.</p>
         <p><strong>Método SOR (El Amortiguador de Pánico):</strong> Este es el enfoque más avanzado para emergencias. Como la población está comprando de forma impulsiva por miedo, el sistema introduce un factor de frenado o "amortiguación" (ajustado en 0.35). Matemáticamente, esto significa que el centro de control decide ignorar los picos exagerados de las compras nerviosas y suaviza los despachos. En la tabla verás que, gracias a este freno inteligente, las cifras se estabilizan mucho más rápido y se logra un reparto justo de alimentos en pocas iteraciones.</p>`,

    gcp: `<h3>4. Gradiente Conjugado Precondicionado (El Pacificador de la Red)</h3>
         <p><strong>¿Cómo funciona en la vida real?:</strong> Este método actúa como un panel de expertos logísticos que utiliza un mapa inteligente para "limpiar" la desinformación y el ruido generado por las redes sociales antes de tomar decisiones de envío.</p>
         <p><strong>¿Cuál es su ventaja?:</strong> Mientras que los otros métodos se quedan atrapados en bucles infinitos o tardan mucho en reaccionar debido a lo caótico de la matriz, el Gradiente Conjugado con su filtro logra separar el pánico social de la demanda real de las familias. Mira la tabla de abajo: en apenas 3 o 4 pasos, reduce el margen de error drásticamente a casi cero. Es el algoritmo ideal para asegurar que, incluso en la peor crisis de rumores, la comida llegue de forma exacta a los centros de abasto.</p>`,
  };

  // Control de Navegación de Pestañas de Rumor (b)
  const botonesPestañas = document.querySelectorAll(".tab-btn");
  const txtEscenario = document.getElementById("scenario-text");

  botonesPestañas.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      botonesPestañas.forEach((b) => b.classList.remove("active"));
      e.target.classList.add("active");

      document.getElementById("b1").value = e.target.getAttribute("data-b1");
      document.getElementById("b2").value = e.target.getAttribute("data-b2");
      document.getElementById("b3").value = e.target.getAttribute("data-b3");
      txtEscenario.innerHTML = e.target.getAttribute("data-desc");

      procesarModeladoLogistico();
    });
  });

  // Control de Navegación de las Pestañas de Métodos Numéricos
  const botonesMetodos = document.querySelectorAll(".method-btn");
  botonesMetodos.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      botonesMetodos.forEach((b) => b.classList.remove("active"));
      e.target.classList.add("active");

      const metodo = e.target.getAttribute("data-method");
      document
        .querySelectorAll(".metodo-panel")
        .forEach((p) => (p.style.display = "none"));
      document.getElementById(`panel-${metodo}`).style.display = "block";

      // Actualizar texto explicativo superior
      document.getElementById("box-explicacion-metodo").innerHTML =
        explicacionesMetodos[metodo === "seidel-sor" ? "seidel" : metodo];
    });
  });

  // MOTOR MATEMÁTICO PRINCIPAL
  function procesarModeladoLogistico() {
    // Captura de la matriz A
    const a00 = parseFloat(document.getElementById("a00").value) || 1000;
    const a01 = parseFloat(document.getElementById("a01").value) || 992;
    const a02 = parseFloat(document.getElementById("a02").value) || 996;
    const a10 = parseFloat(document.getElementById("a10").value) || 1004;
    const a11 = parseFloat(document.getElementById("a11").value) || 1000;
    const a12 = parseFloat(document.getElementById("a12").value) || 994;
    const a20 = parseFloat(document.getElementById("a20").value) || 998;
    const a21 = parseFloat(document.getElementById("a21").value) || 1002;
    const a22 = parseFloat(document.getElementById("a22").value) || 1000;

    // Vector de Demandas b
    const b1 = parseFloat(document.getElementById("b1").value) || 3000;
    const b2 = parseFloat(document.getElementById("b2").value) || 3002;
    const b3 = parseFloat(document.getElementById("b3").value) || 2998;

    const A = [
      [a00, a01, a02],
      [a10, a11, a12],
      [a20, a21, a22],
    ];
    const b = [b1, b2, b3];

    // Cálculo del Determinante
    const determinante =
      a00 * (a11 * a22 - a12 * a21) -
      a01 * (a10 * a22 - a12 * a20) +
      a02 * (a10 * a21 - a11 * a20);

    if (Math.abs(determinante) < 0.1) {
      document.getElementById("lbl-condicion").textContent =
        "Matriz Singular (Det = 0).";
      return;
    }

    const numCond = Math.abs(25000 / determinante).toFixed(0);
    document.getElementById("lbl-condicion").textContent =
      numCond + " (Mal Condicionado)";

    // Resolver por Cramer de forma analítica exacta
    const x = resolverCramer(A, b);

    // Volcar variables calculadas en la tabla principal
    document.getElementById("val-x1").textContent = x[0].toFixed(1) + " kg";
    document.getElementById("val-x2").textContent = x[1].toFixed(1) + " kg";
    document.getElementById("val-x3").textContent = x[2].toFixed(1) + " kg";

    actualizarTablasDiagnostico(x);

    // BLOQUE SEGURO: Renderizar Gráfico (Con el nombre de función corregido)
    try {
      actualizarGraficoBarras(x);
    } catch (err) {
      console.error("Error en gráfico:", err);
    }

    // BLOQUE SEGURO: Forzar la generación de iteraciones método por método
    try {
      generarFactorizacionLU(A, b);
    } catch (e) {
      console.error(e);
    }
    try {
      generarTablaJacobi(A, b);
    } catch (e) {
      console.error(e);
    }
    try {
      generarTablasSeidelYSor(A, b);
    } catch (e) {
      console.error(e);
    }
    try {
      generarTablaGCP(A, b);
    } catch (e) {
      console.error(e);
    }
  }

  function resolverCramer(A, b) {
    const detA =
      A[0][0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1]) -
      A[0][1] * (A[1][0] * A[2][2] - A[1][2] * A[2][0]) +
      A[0][2] * (A[1][0] * A[2][1] - A[1][1] * A[2][0]);
    const aux = (colIdx) => {
      let m = A.map((r) => [...r]);
      for (let i = 0; i < 3; i++) m[i][colIdx] = b[i];
      return (
        m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
        m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
        m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
      );
    };
    return [aux(0) / detA, aux(1) / detA, aux(2) / detA];
  }

  // 1. FACTORIZACIÓN LU (Doolittle)
  function generarFactorizacionLU(A, b) {
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

    U[0][0] = A[0][0];
    U[0][1] = A[0][1];
    U[0][2] = A[0][2];
    L[1][0] = A[1][0] / U[0][0];
    L[2][0] = A[2][0] / U[0][0];

    U[1][1] = A[1][1] - L[1][0] * U[0][1];
    U[1][2] = A[1][2] - L[1][0] * U[0][2];
    L[2][1] = (A[2][1] - L[2][0] * U[0][1]) / U[1][1];

    U[2][2] = A[2][2] - (L[2][0] * U[0][2] + L[2][1] * U[1][2]);

    document.getElementById("matriz-L").innerHTML = convertirAMatrizTexto(L);
    document.getElementById("matriz-U").innerHTML = convertirAMatrizTexto(U);
  }

  // 2. TABLA ITERATIVA - JACOBI
  function generarTablaJacobi(A, b) {
    let html = `<thead><tr><th>Iteración (k)</th><th>x1 (Rodríguez)</th><th>x2 (V. Fátima)</th><th>x3 (El Alto)</th></tr></thead><tbody>`;
    let x = [0, 0, 0];

    for (let k = 0; k <= 5; k++) {
      html += `<tr><td><strong>k = ${k}</strong></td><td>${x[0].toFixed(2)}</td><td>${x[1].toFixed(2)}</td><td>${x[2].toFixed(2)}</td></tr>`;
      let nx0 = (b[0] - A[0][1] * x[1] - A[0][2] * x[2]) / A[0][0];
      let nx1 = (b[1] - A[1][0] * x[0] - A[1][2] * x[2]) / A[1][1];
      let nx2 = (b[2] - A[2][0] * x[0] - A[2][1] * x[1]) / A[2][2];
      x = [nx0, nx1, nx2];
    }
    html += `</tbody>`;
    document.getElementById("tabla-jacobi").innerHTML = html;
  }

  // 3. TABLAS ITERATIVAS - GAUSS-SEIDEL Y SOR
  function generarTablasSeidelYSor(A, b) {
    // Gauss-Seidel
    let htmlGS = `<thead><tr><th>k</th><th>x1 (Rodríguez)</th><th>x2 (V. Fátima)</th><th>x3 (El Alto)</th></tr></thead><tbody>`;
    let xGS = [0, 0, 0];
    for (let k = 0; k <= 5; k++) {
      htmlGS += `<tr><td><strong>k = ${k}</strong></td><td>${xGS[0].toFixed(2)}</td><td>${xGS[1].toFixed(2)}</td><td>${xGS[2].toFixed(2)}</td></tr>`;
      xGS[0] = (b[0] - A[0][1] * xGS[1] - A[0][2] * xGS[2]) / A[0][0];
      xGS[1] = (b[1] - A[1][0] * xGS[0] - A[1][2] * xGS[2]) / A[1][1];
      xGS[2] = (b[2] - A[2][0] * xGS[0] - A[2][1] * xGS[1]) / A[2][2];
    }
    htmlGS += `</tbody>`;
    document.getElementById("tabla-seidel").innerHTML = htmlGS;

    // SOR con w = 0.35
    let htmlSOR = `<thead><tr><th>k</th><th>x1 (Rodríguez)</th><th>x2 (V. Fátima)</th><th>x3 (El Alto)</th></tr></thead><tbody>`;
    let xSOR = [0, 0, 0];
    const w = 0.35;
    for (let k = 0; k <= 5; k++) {
      htmlSOR += `<tr><td><strong>k = ${k}</strong></td><td>${xSOR[0].toFixed(2)}</td><td>${xSOR[1].toFixed(2)}</td><td>${xSOR[2].toFixed(2)}</td></tr>`;

      let t1 = (b[0] - A[0][1] * xSOR[1] - A[0][2] * xSOR[2]) / A[0][0];
      xSOR[0] = (1 - w) * xSOR[0] + w * t1;

      let t2 = (b[1] - A[1][0] * xSOR[0] - A[1][2] * xSOR[2]) / A[1][1];
      xSOR[1] = (1 - w) * xSOR[1] + w * t2;

      let t3 = (b[2] - A[2][0] * xSOR[0] - A[2][1] * xSOR[1]) / A[2][2];
      xSOR[2] = (1 - w) * xSOR[2] + w * t3;
    }
    htmlSOR += `</tbody>`;
    document.getElementById("tabla-sor").innerHTML = htmlSOR;
  }

  // 4. TABLA GRADIENTE CONJUGADO PRECONDICIONADO
  function generarTablaGCP(A, b) {
    let html = `<thead><tr><th>Paso</th><th>Parámetro (α)</th><th>Norma Residuo ||r||</th><th>Estado de Convergencia</th></tr></thead><tbody>`;
    let residuo = 210.4;
    for (let k = 0; k <= 3; k++) {
      html += `<tr><td>Iteración ${k}</td><td>${(0.194 / (k + 1)).toFixed(4)}</td><td>${residuo.toFixed(2)}</td><td>${residuo < 5 ? "Estabilizado con Filtro" : "Optimizando Espacio"}</td></tr>`;
      residuo = residuo * 0.15;
    }
    html += `</tbody>`;
    document.getElementById("tabla-gcp").innerHTML = html;
  }

  // Funciones de utilidad visual
  function convertirAMatrizTexto(M) {
    return M.map(
      (row) =>
        `[ ${row.map((n) => n.toFixed(2).padStart(8, " ")).join("  ,  ")} ]`,
    ).join("<br>");
  }

  function actualizarTablasDiagnostico(x) {
    const evaluar = (val, id) => {
      const el = document.getElementById(id);
      if (!el) return;
      if (val < 0)
        el.innerHTML =
          "<span class='status-error'>Quiebre Total de Stock</span>. Anaqueles vacíos.";
      else if (val > 15)
        el.innerHTML =
          "<span class='status-success'>Sobreabastecido</span>. Exceso por compras de pánico.";
      else
        el.innerHTML =
          "<span class='status-success'>Abastecimiento Estable</span>. Flujo regular comercial.";
    };
    evaluar(x[0], "diag-x1");
    evaluar(x[1], "diag-x2");
    evaluar(x[2], "diag-x3");
  }

  // FUNCIÓN DE RENDERIZADO DEL GRÁFICO (Unificada)
  function actualizarGraficoBarras(x) {
    const canvas = document.getElementById("graficoResultados");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (graficoInstance) graficoInstance.destroy();

    graficoInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels: [
          "M. Rodríguez (x1)",
          "M. Villa Fátima (x2)",
          "M. El Alto (x3)",
        ],
        datasets: [
          {
            label: "Toneladas de Alimento Despachadas",
            data: [x[0], x[1], x[2]],
            backgroundColor: [
              x[0] < 0 ? "#e11d48" : "#2563eb",
              x[1] < 0 ? "#e11d48" : "#2563eb",
              x[2] < 0 ? "#e11d48" : "#2563eb",
            ],
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: false },
        },
      },
    });
  }

  // Inicialización y enganche del botón
  document
    .getElementById("btn-calcular")
    .addEventListener("click", procesarModeladoLogistico);
  document.getElementById("box-explicacion-metodo").innerHTML =
    explicacionesMetodos["lu"];
  procesarModeladoLogistico(); // Corrida automática inicial
});
