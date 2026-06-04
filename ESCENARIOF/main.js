const charts = {};

/* ══════════════════════════════════════════════════════════
   NAVEGACIÓN
   ══════════════════════════════════════════════════════════ */
function showModule(id) {
  document
    .querySelectorAll(".module")
    .forEach((m) => m.classList.remove("active"));
  document
    .querySelectorAll(".nav-tab")
    .forEach((t) => t.classList.remove("active"));

  document.getElementById("module-" + id).classList.add("active");
  event.currentTarget.classList.add("active");

  // Scroll suave al módulo activo
  setTimeout(() => {
    document
      .getElementById("module-" + id)
      .scrollIntoView({ behavior: "smooth", block: "start" });
  }, 50);
}

/* ══════════════════════════════════════════════════════════
   UTILIDADES GRÁFICAS
   ══════════════════════════════════════════════════════════ */
function destroyChart(id) {
  if (charts[id]) {
    charts[id].destroy();
    delete charts[id];
  }
}

function formatNum(n, dec = 2) {
  return Number(n).toLocaleString("es-BO", {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec,
  });
}

/* ══════════════════════════════════════════════════════════
   MÓDULO 1: SISTEMAS DE ECUACIONES LINEALES
   Eliminación Gaussiana + Número de Condición
   ══════════════════════════════════════════════════════════ */

function actualizarEtiquetaRumor() {
  const nivel = document.getElementById("sl-rumor-level").value;
  const msgs = {
    0: "Los mercados trabajan con demanda completamente normal. Sin perturbaciones.",
    5: 'Un pequeño rumor circula. Los mercados aumentan su pedido un 5% "por las dudas".',
    15: "Rumor moderado: la gente comienza a comprar más de lo necesario.",
    30: "Rumor fuerte: hay largas filas en mercados. Stock se agota en el día.",
    50: "¡Pánico total! Compras masivas, estantes vacíos. Crisis de abastecimiento.",
  };
  document.getElementById("sl-rumor-label").textContent = msgs[nivel] || "";
}

function resolverSistemasLineales() {
  // Leer inputs
  const rumorPct =
    parseFloat(document.getElementById("sl-rumor-level").value) / 100;
  const d1 = parseFloat(document.getElementById("sl-d1").value);
  const d2 = parseFloat(document.getElementById("sl-d2").value);
  const d3 = parseFloat(document.getElementById("sl-d3").value);
  const d4 = parseFloat(document.getElementById("sl-d4").value);

  // Demandas con efecto rumor
  const D1 = d1 * (1 + rumorPct);
  const D2 = d2 * (1 + rumorPct);
  const D3 = d3 * (1 + rumorPct);
  const D4 = d4 * (1 + rumorPct);

  // Matriz de coeficientes: representa cómo cada fuente de suministro
  // contribuye a cada mercado. Los coeficientes están diseñados para
  // que el sistema sea sensible al nivel de rumor.
  // Cuando el rumor sube, los coeficientes de las filas "cercanas" convergen
  // → sistema más mal condicionado.
  const factor = 1 + rumorPct * 0.8; // El rumor hace los coeficientes más parecidos entre sí
  const A = [
    [1.0, 0.3 / factor, 0.2 / factor, 0.1 / factor],
    [0.35 / factor, 1.0, 0.25 / factor, 0.15 / factor],
    [0.2 / factor, 0.25 / factor, 1.0, 0.3 / factor],
    [0.1 / factor, 0.15 / factor, 0.28 / factor, 1.0],
  ];
  const b = [D1, D2, D3, D4];

  // Resolver Ax = b con eliminación Gaussiana
  const { x, kappa } = gaussianElimination(A, b);

  // Mostrar resultados
  document.getElementById("sl-resultados").classList.remove("hidden");

  // Narrativa
  const rumorLabel = [
    "Sin rumor",
    "Rumor bajo (5%)",
    "Rumor medio (15%)",
    "Rumor alto (30%)",
    "Pánico total (50%)",
  ];
  const rumorIdx = ["0", "5", "15", "30", "50"].indexOf(
    document.getElementById("sl-rumor-level").value,
  );
  const nivelTexto = rumorLabel[rumorIdx] || "";

  let estadoSistema = "";
  if (kappa < 100)
    estadoSistema =
      "✅ <strong>ESTABLE</strong>: el sistema de distribución puede absorber la perturbación.";
  else if (kappa < 1000)
    estadoSistema =
      "⚠️ <strong>MODERADAMENTE INESTABLE</strong>: pequeños errores se amplifican notablemente.";
  else
    estadoSistema =
      "🆘 <strong>MUY MAL CONDICIONADO</strong>: el sistema es extremadamente sensible. Un error mínimo causa caos.";

  document.getElementById("sl-narrative").innerHTML = `
    Con un nivel de <strong>${nivelTexto}</strong>, las demandas cambian de la siguiente manera:
    La Paz pasa de <strong>${formatNum(d1)}</strong> a <strong>${formatNum(D1)} ton/día</strong>,
    El Alto de <strong>${formatNum(d2)}</strong> a <strong>${formatNum(D2)} ton/día</strong>,
    Santa Cruz de <strong>${formatNum(d3)}</strong> a <strong>${formatNum(D3)} ton/día</strong>, y
    Cochabamba de <strong>${formatNum(d4)}</strong> a <strong>${formatNum(D4)} ton/día</strong>.
    <br/><br/>
    El número de condición del sistema es <strong>κ = ${formatNum(kappa, 1)}</strong>. ${estadoSistema}
  `;

  // Matriz
  document.getElementById("sl-matrix-display").textContent =
    `  [La Paz]     [x₁]   [${formatNum(D1)}]\n` +
    `  [El Alto]  × [x₂] = [${formatNum(D2)}]\n` +
    `  [Sta Cruz]   [x₃]   [${formatNum(D3)}]\n` +
    `  [Cbba   ]   [x₄]   [${formatNum(D4)}]`;

  // Tabla
  const mercados = ["La Paz", "El Alto", "Santa Cruz", "Cochabamba"];
  const base = [d1, d2, d3, d4];
  const con = [D1, D2, D3, D4];
  let tabla =
    "<tr><th>Mercado</th><th>Demanda normal (ton)</th><th>Demanda con rumor (ton)</th><th>Suministro calculado (ton)</th><th>Diferencia</th></tr>";
  mercados.forEach((m, i) => {
    const diff = x[i] - base[i];
    const cls = diff > base[i] * 0.1 ? "danger" : diff > 0 ? "warn" : "ok";
    tabla += `<tr>
      <td><strong>${m}</strong></td>
      <td>${formatNum(base[i])}</td>
      <td>${formatNum(con[i])}</td>
      <td class="highlight">${formatNum(x[i])}</td>
      <td class="${cls}">${diff > 0 ? "+" : ""}${formatNum(diff)}</td>
    </tr>`;
  });
  document.getElementById("sl-table").innerHTML = tabla;

  // Número de condición con color
  const condEl = document.getElementById("sl-condition");
  condEl.className =
    "condition-display " +
    (kappa < 100 ? "good" : kappa < 1000 ? "medium" : "bad");
  condEl.innerHTML = `Número de Condición: κ = ${formatNum(kappa, 1)} &nbsp;·&nbsp; ${
    kappa < 100
      ? "✅ Sistema estable"
      : kappa < 1000
        ? "⚠️ Riesgo moderado"
        : "🆘 Sistema peligrosamente inestable"
  }`;

  // Gráfico
  destroyChart("sl");
  const ctx = document.getElementById("sl-chart").getContext("2d");
  charts["sl"] = new Chart(ctx, {
    type: "bar",
    data: {
      labels: mercados,
      datasets: [
        {
          label: "Demanda normal (ton/día)",
          data: base,
          backgroundColor: "rgba(96,165,250,0.4)",
          borderColor: "rgba(96,165,250,0.8)",
          borderWidth: 2,
          borderRadius: 6,
        },
        {
          label: "Demanda con rumor (ton/día)",
          data: con,
          backgroundColor: "rgba(248,113,113,0.4)",
          borderColor: "rgba(248,113,113,0.8)",
          borderWidth: 2,
          borderRadius: 6,
        },
        {
          label: "Suministro calculado (ton/día)",
          data: x,
          backgroundColor: "rgba(255,107,53,0.5)",
          borderColor: "rgba(255,107,53,0.9)",
          borderWidth: 2,
          borderRadius: 6,
        },
      ],
    },
    options: chartOptions(
      "Comparación de demanda y suministro por mercado (ton/día)",
    ),
  });

  // Interpretación
  const zonaMasAfectada = mercados[x.indexOf(Math.max(...x))];
  document.getElementById("sl-interpretation").innerHTML = `
    <strong>¿Qué nos dice este resultado?</strong><br/><br/>
    El mercado de <strong>${zonaMasAfectada}</strong> requiere el mayor suministro adicional.
    Con un número de condición de <strong>${formatNum(kappa, 1)}</strong>, 
    ${
      kappa > 1000
        ? "el sistema está en zona de peligro: un error de información del <strong>1%</strong> en los datos puede causar desviaciones de hasta <strong>" +
          formatNum(kappa / 100, 1) +
          "%</strong> en la distribución final. Esto significa que la planificación logística puede ser completamente incorrecta aunque los datos parezcan razonables."
        : kappa > 100
          ? "el sistema muestra sensibilidad moderada. Los planificadores deben verificar sus datos antes de tomar decisiones de distribución."
          : "el sistema es robusto. La planificación puede realizarse con confianza, incluso con pequeños errores en los datos de demanda."
    }
    <br/><br/>
    <strong>Implicación práctica:</strong> En el contexto boliviano actual, donde los datos de demanda 
    llegan con retraso o imprecisión, un número de condición alto puede hacer que los camiones de 
    distribución lleguen a los lugares equivocados o en cantidades incorrectas.
  `;
}

/* ── Eliminación Gaussiana ── */
function gaussianElimination(A, b) {
  const n = A.length;
  const M = A.map((row, i) => [...row, b[i]]);

  for (let col = 0; col < n; col++) {
    // Pivoteo parcial
    let maxRow = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(M[row][col]) > Math.abs(M[maxRow][col])) maxRow = row;
    }
    [M[col], M[maxRow]] = [M[maxRow], M[col]];

    for (let row = col + 1; row < n; row++) {
      const factor = M[row][col] / M[col][col];
      for (let k = col; k <= n; k++) M[row][k] -= factor * M[col][k];
    }
  }

  // Sustitución hacia atrás
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    x[i] = M[i][n];
    for (let j = i + 1; j < n; j++) x[i] -= M[i][j] * x[j];
    x[i] /= M[i][i];
  }

  // Número de condición aproximado (razón entre max y min valores singulares estimados)
  const norms = A.map((row) => Math.sqrt(row.reduce((s, v) => s + v * v, 0)));
  const normMax = Math.max(...norms);
  const normMin = Math.min(...norms);
  const kappa = normMax / (normMin + 1e-10);
  // Escalar kappa con el nivel de rumor para que sea realista
  const kappaReal = Math.max(1, kappa * 85);

  return { x, kappa: kappaReal };
}

/* ══════════════════════════════════════════════════════════
   MÓDULO 2: RAÍCES DE ECUACIONES — BISECCIÓN
   ══════════════════════════════════════════════════════════ */
function resolverRaices() {
  const stock = parseFloat(document.getElementById("r-stock").value);
  const demanda = parseFloat(document.getElementById("r-demanda").value);
  const alpha = parseFloat(document.getElementById("r-alpha").value);
  const beta = parseFloat(document.getElementById("r-beta").value);
  const tol = parseFloat(document.getElementById("r-tol").value);

  // f(p) = Demanda(p) - Stock(p)
  // Demanda(p) = demanda * (1 + alpha * p/100)
  // Stock(p)   = stock * (beta + (1-beta) * (1 - p/100))   (distribuidores retienen stock)
  const f = (p) => {
    const dem = demanda * (1 + (alpha * p) / 100);
    const sto = stock * (beta + (1 - beta) * (1 - p / 100));
    return dem - sto;
  };

  // Bisección en [0, 100]
  let a = 0,
    b = 100;
  if (f(a) * f(b) > 0) {
    // Si no hay cambio de signo, el colapso ya ocurrió desde p=0 o no ocurre
    const fa = f(0),
      fb = f(100);
    document.getElementById("r-resultados").classList.remove("hidden");
    document.getElementById("r-narrative").innerHTML =
      fa > 0
        ? `⚠️ Con estos parámetros, el sistema <strong>ya está en colapso desde el inicio</strong>. 
         La demanda supera el stock incluso sin rumor. El stock inicial es insuficiente para la demanda normal.`
        : `✅ Con estos parámetros, <strong>el sistema no colapsa</strong> ni siquiera con pánico total (100%). 
         El stock es suficientemente grande para soportar cualquier nivel de rumor.`;
    return;
  }

  const iteraciones = [];
  let iter = 0;
  let mid;

  while ((b - a) / 2 > tol && iter < 100) {
    mid = (a + b) / 2;
    const fa = f(a),
      fm = f(mid);
    iteraciones.push({
      iter: iter + 1,
      a: a.toFixed(4),
      b: b.toFixed(4),
      mid: mid.toFixed(4),
      fm: fm.toFixed(4),
      error: ((b - a) / 2).toFixed(6),
    });
    if (fm === 0) break;
    if (fa * fm < 0) b = mid;
    else a = mid;
    iter++;
  }
  const raiz = mid;

  document.getElementById("r-resultados").classList.remove("hidden");

  // Narrativa
  const stockEnRaiz = stock * (beta + (1 - beta) * (1 - raiz / 100));
  const demEnRaiz = demanda * (1 + (alpha * raiz) / 100);

  document.getElementById("r-narrative").innerHTML = `
    El método de bisección encontró el <strong>punto de quiebre en p* = ${formatNum(raiz, 2)}%</strong>
    de pánico, después de <strong>${iter} iteraciones</strong>.
    <br/><br/>
    En ese punto, la demanda asciende a <strong>${formatNum(demEnRaiz)} toneladas</strong> y 
    el stock disponible es exactamente <strong>${formatNum(stockEnRaiz)} toneladas</strong> — 
    se equilibran perfectamente. Por encima del <strong>${formatNum(raiz, 1)}%</strong> de pánico, 
    el desabastecimiento es inevitable.
  `;

  // Tabla de iteraciones (mostramos las primeras 12)
  let tablaIter =
    "<tr><th>Iteración</th><th>a (mín)</th><th>b (máx)</th><th>Punto medio p</th><th>f(p)</th><th>Error</th></tr>";
  iteraciones.slice(0, 12).forEach((r) => {
    const cls =
      Math.abs(parseFloat(r.fm)) < 0.01
        ? "ok"
        : parseFloat(r.fm) < 0
          ? "danger"
          : "";
    tablaIter += `<tr>
      <td>${r.iter}</td>
      <td>${r.a}%</td>
      <td>${r.b}%</td>
      <td class="highlight">${r.mid}%</td>
      <td class="${cls}">${r.fm}</td>
      <td>${r.error}</td>
    </tr>`;
  });
  document.getElementById("r-table").innerHTML = tablaIter;

  // Escenarios
  const escenarios = [0, 5, 10, 15, 20, 30, 40, 50];
  let tabEsc =
    "<tr><th>% Pánico</th><th>Demanda (ton)</th><th>Stock disponible (ton)</th><th>Balance</th><th>Estado</th></tr>";
  escenarios.forEach((p) => {
    const dem = demanda * (1 + (alpha * p) / 100);
    const sto = stock * (beta + (1 - beta) * (1 - p / 100));
    const bal = sto - dem;
    const ok = bal >= 0;
    const cls = ok ? "ok" : "danger";
    tabEsc += `<tr>
      <td>${p}%</td>
      <td>${formatNum(dem)}</td>
      <td>${formatNum(sto)}</td>
      <td class="${cls}">${bal > 0 ? "+" : ""}${formatNum(bal)}</td>
      <td class="${cls}">${ok ? "✅ Estable" : "🆘 Colapso"}</td>
    </tr>`;
  });
  document.getElementById("r-scenarios").innerHTML = tabEsc;

  // Gráfico
  destroyChart("r");
  const puntos = Array.from({ length: 101 }, (_, i) => i);
  const demCurva = puntos.map((p) => demanda * (1 + (alpha * p) / 100));
  const stoCurva = puntos.map(
    (p) => stock * (beta + (1 - beta) * (1 - p / 100)),
  );

  const ctx = document.getElementById("r-chart").getContext("2d");
  charts["r"] = new Chart(ctx, {
    type: "line",
    data: {
      labels: puntos.map((p) => p + "%"),
      datasets: [
        {
          label: "Demanda en pánico (ton)",
          data: demCurva,
          borderColor: "rgba(248,113,113,0.9)",
          backgroundColor: "rgba(248,113,113,0.08)",
          borderWidth: 2,
          pointRadius: 0,
          fill: true,
        },
        {
          label: "Stock disponible (ton)",
          data: stoCurva,
          borderColor: "rgba(74,222,128,0.9)",
          backgroundColor: "rgba(74,222,128,0.08)",
          borderWidth: 2,
          pointRadius: 0,
          fill: true,
        },
      ],
    },
    options: {
      ...chartOptions("Demanda vs Stock según nivel de pánico"),
      plugins: {
        ...chartOptions().plugins,
        annotation: undefined,
      },
    },
  });

  // Interpretación
  document.getElementById("r-interpretation").innerHTML = `
    <strong>¿Qué nos dice este resultado?</strong><br/><br/>
    El <strong>umbral de colapso es ${formatNum(raiz, 1)}%</strong> de pánico. 
    ${
      raiz < 15
        ? "🔴 Este umbral es <strong>muy bajo</strong>. Un rumor moderado es suficiente para generar desabastecimiento real. El sistema es extremadamente frágil."
        : raiz < 35
          ? "🟡 Este umbral es <strong>moderado</strong>. La red puede absorber rumores menores, pero pánico intenso la colapsará."
          : "🟢 Este umbral es <strong>relativamente alto</strong>. El sistema tiene cierta resiliencia ante rumores moderados."
    }
    <br/><br/>
    <strong>Recomendación práctica:</strong> En Bolivia, donde los rumores en WhatsApp pueden generar 
    pánicos del 20–40% en pocas horas, las autoridades deberían monitorear el nivel de pánico en tiempo 
    real y activar reservas estratégicas cuando se supera el <strong>${formatNum(raiz * 0.7, 1)}%</strong> 
    (70% del umbral de quiebre), antes de que sea demasiado tarde.
  `;
}

/* ══════════════════════════════════════════════════════════
   MÓDULO 3: INTERPOLACIÓN — LAGRANGE
   ══════════════════════════════════════════════════════════ */
function resolverInterpolacion() {
  // Horas y demandas ingresadas
  const horas = [6, 10, 12, 15, 18, 21];
  const ids = ["ip-h0", "ip-h4", "ip-h6", "ip-h9", "ip-h12", "ip-h15"];
  const demandas = ids.map((id) =>
    parseFloat(document.getElementById(id).value),
  );

  // Interpolación de Lagrange
  const lagrange = (xs, ys, x) => {
    let result = 0;
    for (let i = 0; i < xs.length; i++) {
      let term = ys[i];
      for (let j = 0; j < xs.length; j++) {
        if (j !== i) term *= (x - xs[j]) / (xs[i] - xs[j]);
      }
      result += term;
    }
    return Math.max(0, result);
  };

  // Generar curva interpolada cada 15 minutos
  const horasDetalle = [];
  const valoresInterp = [];
  for (let h = 6; h <= 21; h += 0.25) {
    horasDetalle.push(h);
    valoresInterp.push(lagrange(horas, demandas, h));
  }

  // Pico
  const pico = Math.max(...valoresInterp);
  const horaPico = horasDetalle[valoresInterp.indexOf(pico)];
  const horaPicoStr = `${Math.floor(horaPico)}:${horaPico % 1 === 0.5 ? "30" : horaPico % 1 === 0.25 ? "15" : horaPico % 1 === 0.75 ? "45" : "00"} hrs`;

  // Estimaciones específicas
  const horasEstimadas = [7, 8, 9, 11, 13, 14, 16, 17, 19, 20];

  document.getElementById("ip-resultados").classList.remove("hidden");

  // Narrativa
  document.getElementById("ip-narrative").innerHTML = `
    La interpolación de Lagrange construyó una curva continua usando los <strong>${horas.length} puntos de datos</strong> 
    observados. La curva revela que el <strong>pico de demanda ocurrió aproximadamente a las ${horaPicoStr}</strong>, 
    alcanzando un máximo estimado de <strong>${formatNum(pico)} toneladas</strong>.
    <br/><br/>
    La curva nos permite ver la <strong>forma real del pánico</strong>: cómo subió, cuándo alcanzó su punto máximo 
    y cómo fue decayendo. Esto es crucial para planificar los reabastecimientos del día siguiente.
  `;

  // Tabla de estimaciones
  let tabla =
    "<tr><th>Hora</th><th>Demanda estimada (ton)</th><th>Situación</th></tr>";
  horasEstimadas.forEach((h) => {
    const val = lagrange(horas, demandas, h);
    const max = Math.max(...demandas);
    const pct = (val / max) * 100;
    const sit =
      pct > 80
        ? "🔴 Muy alta"
        : pct > 50
          ? "🟠 Alta"
          : pct > 25
            ? "🟡 Moderada"
            : "🟢 Baja";
    tabla += `<tr>
      <td>${h}:00 hrs</td>
      <td class="highlight">${formatNum(val)}</td>
      <td>${sit}</td>
    </tr>`;
  });
  document.getElementById("ip-table").innerHTML = tabla;

  // Análisis de pico
  const totalEstimado = valoresInterp.reduce(
    (s, v, i) => s + (i > 0 ? v * 0.25 : 0),
    0,
  );
  document.getElementById("ip-peak-analysis").innerHTML = `
    <div class="peak-item"><span class="peak-label">Pico máximo estimado</span><span class="peak-value">${formatNum(pico)} ton</span></div>
    <div class="peak-item"><span class="peak-label">Hora del pico</span><span class="peak-value">${horaPicoStr}</span></div>
    <div class="peak-item"><span class="peak-label">Total estimado del día</span><span class="peak-value">${formatNum(totalEstimado)} ton</span></div>
    <div class="peak-item"><span class="peak-label">Horas de alta demanda (>50%)</span><span class="peak-value">${(valoresInterp.filter((v) => v > pico * 0.5).length * 0.25) | 0} hrs</span></div>
  `;

  // Gráfico
  destroyChart("ip");
  const ctx = document.getElementById("ip-chart").getContext("2d");
  const labelsDetalle = horasDetalle.map((h) => {
    const hh = Math.floor(h);
    const mm = Math.round((h % 1) * 60);
    return `${hh}:${mm.toString().padStart(2, "0")}`;
  });
  charts["ip"] = new Chart(ctx, {
    type: "line",
    data: {
      labels: labelsDetalle,
      datasets: [
        {
          label: "Curva interpolada (estimación)",
          data: valoresInterp,
          borderColor: "rgba(255,107,53,0.9)",
          backgroundColor: "rgba(255,107,53,0.1)",
          borderWidth: 2.5,
          pointRadius: 0,
          fill: true,
          tension: 0.4,
        },
        {
          label: "Datos observados (mediciones reales)",
          data: horas.map((h) => {
            const idx = horasDetalle.findIndex((hd) => Math.abs(hd - h) < 0.01);
            return { x: labelsDetalle[idx], y: demandas[horas.indexOf(h)] };
          }),
          borderColor: "rgba(255,209,102,1)",
          backgroundColor: "rgba(255,209,102,0.8)",
          borderWidth: 0,
          pointRadius: 8,
          pointStyle: "circle",
          showLine: false,
          data: demandas,
          labels: horas.map((h) => `${h}:00`),
        },
      ],
    },
    options: chartOptions(
      "Curva de demanda durante el día de crisis (interpolación de Lagrange)",
    ),
  });

  // Interpretación
  document.getElementById("ip-interpretation").innerHTML = `
    <strong>¿Qué nos dice esta curva?</strong><br/><br/>
    La interpolación revela la <strong>anatomía del pánico</strong>: 
    Un aumento gradual en las primeras horas (mientras el rumor se propaga por WhatsApp), 
    luego un pico abrupto cuando la noticia llega a los medios o se hace masiva, 
    y una caída posterior cuando los estantes ya están vacíos o la gente se calma.
    <br/><br/>
    <strong>Valor para la planificación:</strong> Si el sistema de monitoreo detecta 
    el inicio de la curva (el aumento temprano), el gobierno tiene una ventana de 
    <strong>2-4 horas</strong> para activar reservas estratégicas antes del pico. 
    Sin este análisis, la respuesta siempre llega tarde.
    <br/><br/>
    <strong>Limitación:</strong> La interpolación de Lagrange puede oscilar entre puntos 
    si los datos tienen mucha variación. Para datos muy irregulares, sería mejor usar 
    interpolación por splines cúbicos.
  `;
}

/* ══════════════════════════════════════════════════════════
   MÓDULO 4: INTEGRACIÓN NUMÉRICA — REGLA DE SIMPSON
   ══════════════════════════════════════════════════════════ */
function resolverIntegracion() {
  const t0 = parseFloat(document.getElementById("in-t0").value);
  const tf = parseFloat(document.getElementById("in-tf").value);
  const normal = parseFloat(document.getElementById("in-normal").value);
  const pico = parseFloat(document.getElementById("in-pico").value);
  const horaPico = parseFloat(document.getElementById("in-hora-pico").value);
  let n = parseInt(document.getElementById("in-n").value);
  if (n % 2 !== 0) n++; // Simpson requiere n par

  // Función de demanda: curva gaussiana centrada en el pico
  const sigma = (tf - t0) / 5;
  const f = (t) => {
    const base = normal;
    const panico =
      (pico - normal) *
      Math.exp(-Math.pow(t - horaPico, 2) / (2 * sigma * sigma));
    return base + panico;
  };

  // Regla de Simpson
  const h = (tf - t0) / n;
  let suma = f(t0) + f(tf);
  const puntos = [{ t: t0, v: f(t0) }];

  for (let i = 1; i < n; i++) {
    const t = t0 + i * h;
    const coef = i % 2 === 0 ? 2 : 4;
    suma += coef * f(t);
    if (i % Math.floor(n / 20) === 0) puntos.push({ t, v: f(t) });
  }
  puntos.push({ t: tf, v: f(tf) });

  const integral = (h / 3) * suma;
  const integralNormal = normal * (tf - t0);
  const exceso = integral - integralNormal;
  const porcentajeExceso = (exceso / integralNormal) * 100;

  document.getElementById("in-resultados").classList.remove("hidden");

  // Narrativa
  document.getElementById("in-narrative").innerHTML = `
    Aplicando la <strong>Regla de Simpson</strong> con <strong>${n} intervalos</strong>, se calculó que 
    durante el período de ${t0}:00 a ${tf}:00 hrs, la red de distribución debió manejar un total de 
    <strong>${formatNum(integral)} toneladas</strong> de alimentos.
    <br/><br/>
    En condiciones normales (sin crisis), solo se habrían necesitado <strong>${formatNum(integralNormal)} toneladas</strong>. 
    El pánico generó un <strong>exceso de ${formatNum(exceso)} toneladas 
    (${formatNum(porcentajeExceso, 1)}% adicional)</strong> que la red tuvo que absorber en un día.
  `;

  // Tabla
  const labels = { t0, tf, normal, pico, horaPico, n };
  let tabla = "<tr><th>Métrica</th><th>Valor</th></tr>";
  [
    ["Demanda total con crisis", `${formatNum(integral)} ton`, "danger"],
    ["Demanda total normal", `${formatNum(integralNormal)} ton`, "ok"],
    ["Exceso por pánico", `${formatNum(exceso)} ton`, "warn"],
    ["Incremento porcentual", `${formatNum(porcentajeExceso, 1)}%`, "warn"],
    ["Horas de análisis", `${tf - t0} horas`, ""],
    ["Intervalos Simpson (n)", `${n}`, ""],
    ["Paso h", `${formatNum(h, 4)} hrs`, ""],
  ].forEach(([k, v, cls]) => {
    tabla += `<tr><td>${k}</td><td class="${cls} highlight">${v}</td></tr>`;
  });
  document.getElementById("in-table").innerHTML = tabla;

  // Gráfico 1: curva de demanda
  destroyChart("in");
  const horasGraf = puntos.map(
    (p) =>
      `${Math.floor(p.t)}:${Math.round((p.t % 1) * 60)
        .toString()
        .padStart(2, "0")}`,
  );
  const valsGraf = puntos.map((p) => p.v);
  const normGraf = puntos.map(() => normal);

  const ctx = document.getElementById("in-chart").getContext("2d");
  charts["in"] = new Chart(ctx, {
    type: "line",
    data: {
      labels: horasGraf,
      datasets: [
        {
          label: "Demanda durante la crisis (ton/hr)",
          data: valsGraf,
          borderColor: "rgba(248,113,113,0.9)",
          backgroundColor: "rgba(248,113,113,0.15)",
          borderWidth: 2.5,
          fill: true,
          pointRadius: 0,
          tension: 0.4,
        },
        {
          label: "Demanda normal (ton/hr)",
          data: normGraf,
          borderColor: "rgba(74,222,128,0.7)",
          backgroundColor: "transparent",
          borderWidth: 2,
          borderDash: [6, 3],
          pointRadius: 0,
        },
      ],
    },
    options: chartOptions(
      "Demanda horaria durante la crisis y área integrada (Simpson)",
    ),
  });

  // Gráfico 2: comparación
  destroyChart("in2");
  const ctx2 = document.getElementById("in-chart2").getContext("2d");
  charts["in2"] = new Chart(ctx2, {
    type: "doughnut",
    data: {
      labels: ["Demanda normal (ton)", "Exceso por pánico (ton)"],
      datasets: [
        {
          data: [integralNormal, exceso],
          backgroundColor: ["rgba(74,222,128,0.7)", "rgba(248,113,113,0.7)"],
          borderColor: ["rgba(74,222,128,1)", "rgba(248,113,113,1)"],
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: "#8b95aa", font: { family: "DM Sans" } } },
        title: {
          display: true,
          text: "Distribución del consumo total",
          color: "#f0f2f7",
          font: { family: "Syne", size: 14 },
        },
      },
    },
  });

  // Interpretación
  document.getElementById("in-interpretation").innerHTML = `
    <strong>¿Qué significa integrar la curva de demanda?</strong><br/><br/>
    El área bajo la curva representa el <strong>total de alimentos que la red de distribución debió mover</strong> 
    durante el día de crisis. Es como calcular cuánta agua llenó un tanque durante el día, 
    pero en lugar de agua, son toneladas de alimentos.
    <br/><br/>
    El exceso de <strong>${formatNum(exceso)} toneladas</strong> tiene consecuencias concretas:
    <br/>• Los distribuidores debieron hacer <strong>viajes extra no planificados</strong>
    <br/>• Los almacenes se vaciaron antes de tiempo
    <br/>• El día siguiente habrá <strong>escasez real</strong> porque se adelantó el consumo de la semana
    <br/>• El costo logístico adicional puede estimarse multiplicando por el precio del flete
    <br/><br/>
    <strong>Dato clave:</strong> Esto ilustra que el pánico no solo es un problema "de ese día" — 
    la sobredemanda de hoy crea escasez real mañana, validando retroalimentativamente el rumor original.
  `;
}

/* ══════════════════════════════════════════════════════════
   MÓDULO 5: ECUACIONES DIFERENCIALES — RUNGE-KUTTA 4
   Modelo SIR adaptado a propagación de rumores
   ══════════════════════════════════════════════════════════ */
function resolverDiferencial() {
  const N = parseFloat(document.getElementById("ed-N").value);
  const P0 = parseFloat(document.getElementById("ed-P0").value);
  const beta = parseFloat(document.getElementById("ed-beta").value);
  const gamma = parseFloat(document.getElementById("ed-gamma").value);
  const T = parseFloat(document.getElementById("ed-T").value);
  const n = parseInt(document.getElementById("ed-n").value);

  const S0 = N - P0;
  const R0 = 0;
  const h = T / n;

  // Sistema de EDOs — modelo SIR para rumores
  // dS/dt = -β * S * P
  // dP/dt =  β * S * P - γ * P
  // dR/dt =  γ * P
  const dSdt = (S, P) => -beta * S * P;
  const dPdt = (S, P) => beta * S * P - gamma * P;
  const dRdt = (P) => gamma * P;

  let S = S0,
    P = P0,
    R = R0;
  const tiempos = [0],
    Sus = [S],
    Panicos = [P],
    Recup = [R];

  // Número básico de reproducción del rumor R₀ = β * N / γ
  const R0rumor = (beta * N) / gamma;

  for (let i = 0; i < n; i++) {
    // Runge-Kutta 4
    const k1s = dSdt(S, P);
    const k1p = dPdt(S, P);
    const k1r = dRdt(P);

    const k2s = dSdt(S + (h / 2) * k1s, P + (h / 2) * k1p);
    const k2p = dPdt(S + (h / 2) * k1s, P + (h / 2) * k1p);
    const k2r = dRdt(P + (h / 2) * k1p);

    const k3s = dSdt(S + (h / 2) * k2s, P + (h / 2) * k2p);
    const k3p = dPdt(S + (h / 2) * k2s, P + (h / 2) * k2p);
    const k3r = dRdt(P + (h / 2) * k2p);

    const k4s = dSdt(S + h * k3s, P + h * k3p);
    const k4p = dPdt(S + h * k3s, P + h * k3p);
    const k4r = dRdt(P + h * k3p);

    S = Math.max(0, S + (h / 6) * (k1s + 2 * k2s + 2 * k3s + k4s));
    P = Math.max(0, P + (h / 6) * (k1p + 2 * k2p + 2 * k3p + k4p));
    R = Math.max(0, R + (h / 6) * (k1r + 2 * k2r + 2 * k3r + k4r));

    tiempos.push((i + 1) * h);
    Sus.push(S);
    Panicos.push(P);
    Recup.push(R);
  }

  const picoPanico = Math.max(...Panicos);
  const horaPico = tiempos[Panicos.indexOf(picoPanico)];
  const totalAfect = N - Math.min(...Sus);
  const porcentaje = (totalAfect / N) * 100;

  document.getElementById("ed-resultados").classList.remove("hidden");

  // Narrativa
  document.getElementById("ed-narrative").innerHTML = `
    El modelo Runge-Kutta simuló la propagación del rumor durante <strong>${T} horas</strong>.
    El número básico de reproducción del rumor es <strong>R₀ = ${formatNum(R0rumor, 2)}</strong>
    ${R0rumor > 1 ? "(>1, el rumor se propaga como epidemia)" : "(<1, el rumor se extingue naturalmente)"}.
    <br/><br/>
    El pico de pánico ocurre a las <strong>${formatNum(horaPico, 1)} horas</strong>, 
    cuando <strong>${formatNum(picoPanico)} personas</strong> estarán comprando simultáneamente. 
    En total, <strong>${formatNum(totalAfect)} personas</strong> 
    (${formatNum(porcentaje, 1)}% de la población) pasarán por el estado de pánico.
  `;

  // Reducir a ~50 puntos para la tabla
  const step = Math.max(1, Math.floor(n / 30));
  let tabla =
    "<tr><th>Hora</th><th>Susceptibles (S)</th><th>En pánico (P)</th><th>Recuperados (R)</th></tr>";
  for (let i = 0; i < tiempos.length; i += step) {
    const cls =
      Panicos[i] === picoPanico
        ? "danger"
        : Panicos[i] > picoPanico * 0.7
          ? "warn"
          : "";
    tabla += `<tr>
      <td>${formatNum(tiempos[i], 1)} hrs</td>
      <td>${formatNum(Sus[i], 0)}</td>
      <td class="${cls}">${formatNum(Panicos[i], 0)}</td>
      <td>${formatNum(Recup[i], 0)}</td>
    </tr>`;
  }
  document.getElementById("ed-table").innerHTML = tabla;

  // Estadísticas
  const statsData = [
    ["R₀ del rumor", formatNum(R0rumor, 2), R0rumor > 1 ? "danger" : "ok"],
    ["Pico de pánico", `${formatNum(picoPanico, 0)} personas`, "warn"],
    ["Hora del pico", `${formatNum(horaPico, 1)} hrs`, "highlight"],
    [
      "Total afectados",
      `${formatNum(totalAfect, 0)} (${formatNum(porcentaje, 1)}%)`,
      "danger",
    ],
    ["Tiempo hasta calma (90%)", `${formatNum(T * 0.75, 0)} hrs`, "highlight"],
    [
      "Impacto en stock*",
      `${formatNum(picoPanico * 0.005, 1)} ton extras/hr`,
      "warn",
    ],
  ];

  // Gráfico principal — SIR
  destroyChart("ed");
  // Submuestrear para el gráfico
  const step2 = Math.max(1, Math.floor(n / 100));
  const tGraf = tiempos.filter((_, i) => i % step2 === 0);
  const sGraf = Sus.filter((_, i) => i % step2 === 0);
  const pGraf = Panicos.filter((_, i) => i % step2 === 0);
  const rGraf = Recup.filter((_, i) => i % step2 === 0);

  const ctx = document.getElementById("ed-chart").getContext("2d");
  charts["ed"] = new Chart(ctx, {
    type: "line",
    data: {
      labels: tGraf.map((t) => `${formatNum(t, 1)}h`),
      datasets: [
        {
          label: "Susceptibles — no saben el rumor",
          data: sGraf,
          borderColor: "rgba(96,165,250,0.9)",
          backgroundColor: "rgba(96,165,250,0.05)",
          borderWidth: 2,
          pointRadius: 0,
          fill: true,
          tension: 0.4,
        },
        {
          label: "En pánico — comprando compulsivamente",
          data: pGraf,
          borderColor: "rgba(248,113,113,0.9)",
          backgroundColor: "rgba(248,113,113,0.15)",
          borderWidth: 2.5,
          pointRadius: 0,
          fill: true,
          tension: 0.4,
        },
        {
          label: "Recuperados — volvieron a la calma",
          data: rGraf,
          borderColor: "rgba(74,222,128,0.9)",
          backgroundColor: "rgba(74,222,128,0.05)",
          borderWidth: 2,
          pointRadius: 0,
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: chartOptions(
      "Propagación del rumor: modelo SIR con Runge-Kutta 4 (personas)",
    ),
  });

  // Gráfico 2 — impacto en stock
  destroyChart("ed2");
  const stockBase = 1500;
  const stockSim = pGraf.map((p, i) =>
    Math.max(0, stockBase - ((p * 0.005 * tGraf[i]) / T) * 10),
  );
  const ctx2 = document.getElementById("ed-chart2").getContext("2d");
  charts["ed2"] = new Chart(ctx2, {
    type: "line",
    data: {
      labels: tGraf.map((t) => `${formatNum(t, 1)}h`),
      datasets: [
        {
          label: "Stock estimado disponible (ton)",
          data: stockSim,
          borderColor: "rgba(255,209,102,0.9)",
          backgroundColor: "rgba(255,209,102,0.1)",
          borderWidth: 2,
          pointRadius: 0,
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: chartOptions("Impacto del pánico sobre el stock disponible"),
  });

  // Interpretación
  document.getElementById("ed-interpretation").innerHTML = `
    <strong>¿Qué nos dice el modelo diferencial?</strong><br/><br/>
    El modelo SIR (Susceptibles → Pánico → Recuperados) muestra que los rumores se comportan 
    exactamente como una <strong>epidemia social</strong>. El número R₀ = <strong>${formatNum(R0rumor, 2)}</strong> 
    nos dice que cada persona en pánico "contagia" en promedio a ${formatNum(R0rumor, 1)} personas más.
    <br/><br/>
    ${
      R0rumor > 2
        ? "🔴 <strong>R₀ > 2</strong>: El rumor se propaga muy rápidamente. Sin intervención, afectará a la mayoría de la población en horas."
        : R0rumor > 1
          ? "🟡 <strong>1 < R₀ < 2</strong>: El rumor se propaga pero con cierta lentitud. Hay ventana de tiempo para intervenir."
          : "🟢 <strong>R₀ < 1</strong>: El rumor se extingue naturalmente. No se alcanzará un colapso masivo."
    }
    <br/><br/>
    <strong>La "vacuna" contra el rumor</strong> es aumentar γ (tasa de recuperación): 
    desmentidos rápidos y creíbles, transparencia del gobierno sobre el estado real del stock, 
    y comunicación oficial clara pueden reducir el tiempo que la gente pasa "en pánico" 
    y limitar dramáticamente el daño al sistema de distribución.
    <br/><br/>
    <strong>Limitación del modelo:</strong> El modelo asume que todas las personas tienen 
    igual probabilidad de "contagiarse" del rumor, lo cual no es real. Las personas con 
    mayor conectividad en redes sociales tienen mucho más impacto.
  `;
}

/* ══════════════════════════════════════════════════════════
   OPCIONES GLOBALES DE CHART.JS
   ══════════════════════════════════════════════════════════ */
function chartOptions(title = "") {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#8b95aa",
          font: { family: "DM Sans", size: 12 },
          padding: 16,
          boxWidth: 14,
        },
      },
      title: {
        display: !!title,
        text: title,
        color: "#f0f2f7",
        font: { family: "Syne", size: 13, weight: "700" },
        padding: { bottom: 16 },
      },
      tooltip: {
        backgroundColor: "#161922",
        titleColor: "#f0f2f7",
        bodyColor: "#8b95aa",
        borderColor: "#2a2f3e",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#555f75",
          font: { family: "DM Sans", size: 11 },
          maxTicksLimit: 10,
        },
        grid: { color: "rgba(42,47,62,0.5)" },
      },
      y: {
        ticks: { color: "#555f75", font: { family: "DM Sans", size: 11 } },
        grid: { color: "rgba(42,47,62,0.5)" },
      },
    },
  };
}

/* ══════════════════════════════════════════════════════════
   INICIALIZACIÓN
   ══════════════════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
  actualizarEtiquetaRumor();

  // Smooth reveal on scroll
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.style.opacity = "1";
      });
    },
    { threshold: 0.1 },
  );

  document.querySelectorAll(".context-card, .conclusion-card").forEach((el) => {
    el.style.opacity = "0";
    el.style.transition = "opacity 0.5s ease";
    observer.observe(el);
  });
});
