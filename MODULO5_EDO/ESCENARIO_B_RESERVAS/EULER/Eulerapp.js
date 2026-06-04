let chartEuler = null;

// ==================== ESCENARIO B: RESERVAS ====================
function calcularEulerReservas() {
  const R0 = parseFloat(document.getElementById("reservaInicial").value);
  const consumo = parseFloat(document.getElementById("consumoDiario").value);
  const entrada = parseFloat(document.getElementById("entradaDiaria").value);
  const dias = parseFloat(document.getElementById("diasSimular").value);
  const h = parseFloat(document.getElementById("paso").value);
  
  const n = Math.ceil(dias / h);
  let t = Array(n + 1).fill(0);
  let R = Array(n + 1).fill(0);
  R[0] = R0;
  
  function dRdt(Rval) { return entrada - consumo; }
  
  // Desarrollo paso a paso
  let pasos = [];
  for (let i = 0; i < n; i++) {
    t[i + 1] = t[i] + h;
    let derivada = dRdt(R[i]);
    let incremento = h * derivada;
    R[i + 1] = R[i] + incremento;
    if (R[i + 1] < 0) R[i + 1] = 0;
    
    pasos.push({
      paso: i + 1,
      t: t[i],
      R_actual: R[i],
      derivada: derivada,
      incremento: incremento,
      R_siguiente: R[i + 1]
    });
  }
  
  // Encontrar día crítico
  let diaCritico = -1;
  for (let i = 0; i <= n; i++) {
    if (R[i] <= 0) {
      diaCritico = t[i];
      break;
    }
  }
  
  const sinCambios = R0;
  const perdida = R0 - (diaCritico !== -1 ? 0 : R[n]);
  
  // Mostrar resultados
  mostrarResultadosEulerReservas(pasos, t, R, diaCritico, R0, consumo, entrada, h);
}

function mostrarResultadosEulerReservas(pasos, t, R, diaCritico, R0, consumo, entrada, h) {
  document.getElementById("resultadosCard").style.display = "block";
  document.getElementById("resultadosTitle").innerHTML = "⛽ Vaciado de reservas - Método de Euler";
  
  // Cabecera de la tabla
  document.getElementById("tablaHead").innerHTML = `
    <tr><th>Paso</th><th>t (días)</th><th>R actual (L)</th><th>dR/dt = entrada-consumo</th><th>ΔR = h × derivada</th><th>R siguiente (L)</th></tr>
  `;
  
  // Cuerpo de la tabla (mostrar solo algunos pasos para no saturar)
  const tbody = document.getElementById("tablaBody");
  tbody.innerHTML = "";
  
  // Mostrar cada 5 pasos
  for (let i = 0; i < pasos.length; i += Math.ceil(pasos.length / 15)) {
    const p = pasos[i];
    tbody.innerHTML += `
      <tr>
        <td>${p.paso}</td>
        <td>${p.t.toFixed(2)}</td>
        <td>${p.R_actual.toFixed(2)}</td>
        <td>${p.derivada.toFixed(2)}</td>
        <td>${p.incremento.toFixed(2)}</td>
        <td>${p.R_siguiente.toFixed(2)}</td>
      </tr>
    `;
  }
  
  // Resultado final
  const resultadoFinal = diaCritico !== -1 ? R[pasos.length] : R[pasos.length];
  document.getElementById("resultadoFinal").innerHTML = `
    <div class="resultado-valor">Reserva final: ${resultadoFinal.toFixed(2)} L</div>
    <div class="resultado-detalle">
      <p>📊 <strong>Día crítico:</strong> ${diaCritico !== -1 ? diaCritico.toFixed(2) : "Nunca"} días</p>
      <p>💰 <strong>Reserva inicial:</strong> ${R0} L</p>
      <p>⛽ <strong>Consumo diario:</strong> ${consumo} L/día | 🚚 <strong>Entrada:</strong> ${entrada} L/día</p>
      <p>📉 <strong>Déficit diario:</strong> ${consumo - entrada} L/día</p>
    </div>
  `;
  
  // Interpretación
  let interpretacion = "";
  if (diaCritico !== -1 && diaCritico < 10) {
    interpretacion = `⚠️ <strong>CRISIS INMEDIATA:</strong> La reserva se agota en solo ${diaCritico.toFixed(1)} días. El déficit diario de ${consumo - entrada} L es insostenible. Se requiere intervención urgente.`;
  } else if (diaCritico !== -1 && diaCritico < 20) {
    interpretacion = `🔴 <strong>SITUACIÓN CRÍTICA:</strong> La reserva se agota en ${diaCritico.toFixed(1)} días. El consumo supera a la entrada en ${consumo - entrada} L/día.`;
  } else if (diaCritico !== -1) {
    interpretacion = `⚠️ <strong>SITUACIÓN PREOCUPANTE:</strong> La reserva se agota en ${diaCritico.toFixed(1)} días. Se necesita aumentar la entrada o reducir el consumo.`;
  } else {
    interpretacion = `✅ <strong>SITUACIÓN ESTABLE:</strong> La reserva no se agota porque la entrada (${entrada} L/día) es mayor o igual al consumo (${consumo} L/día).`;
  }
  
  document.getElementById("interpretacionEuler").innerHTML = `
    <p><strong>📖 Interpretación del resultado:</strong></p>
    <p>${interpretacion}</p>
    <p><strong>🔍 Precisión del método:</strong> Euler tiene error O(h) = ${h.toFixed(2)}. Para mayor precisión, se recomienda usar Heun o RK4.</p>
  `;
  
  // Gráfica
  const ctx = document.getElementById("graficoEuler").getContext("2d");
  if (chartEuler) chartEuler.destroy();
  
  chartEuler = new Chart(ctx, {
    type: 'line',
    data: {
      labels: t.map(v => v.toFixed(1)),
      datasets: [{
        label: 'Reserva (litros) - Euler',
        data: R,
        borderColor: '#e74c3c',
        backgroundColor: 'rgba(231, 76, 60, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: { legend: { labels: { color: '#e0e0e0' } } },
      scales: {
        y: { title: { display: true, text: 'Reserva (L)', color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true },
        x: { title: { display: true, text: 'Tiempo (días)', color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
      }
    }
  });
}

// ==================== ESCENARIO G: DIFUSIÓN SOCIAL ====================
function calcularEulerSocial() {
  const N0 = parseFloat(document.getElementById("neutrales0").value);
  const M0 = parseFloat(document.getElementById("manifestantes0").value);
  const D0 = parseFloat(document.getElementById("mediadores0").value);
  const a = parseFloat(document.getElementById("tasaInfluencia").value);
  const b = parseFloat(document.getElementById("tasaRecuperacion").value);
  const c = parseFloat(document.getElementById("efectividadDialogo").value);
  const k = parseFloat(document.getElementById("reaccionInstitucional").value);
  const r = parseFloat(document.getElementById("desgasteMediadores").value);
  const dias = parseFloat(document.getElementById("diasSocial").value);
  const h = parseFloat(document.getElementById("pasoSocial").value);
  
  const n = Math.ceil(dias / h);
  let t = Array(n + 1).fill(0);
  let N = Array(n + 1).fill(0);
  let M = Array(n + 1).fill(0);
  let D = Array(n + 1).fill(0);
  
  N[0] = N0;
  M[0] = M0;
  D[0] = D0;
  
  function dNdt(Nval, Mval, Dval) { return -a * Nval * Mval + b * Dval; }
  function dMdt(Nval, Mval, Dval) { return a * Nval * Mval - c * Mval * Dval; }
  function dDdt(Mval, Dval) { return k * Mval - r * Dval; }
  
  let pasos = [];
  for (let i = 0; i < n; i++) {
    t[i + 1] = t[i] + h;
    
    let derivN = dNdt(N[i], M[i], D[i]);
    let derivM = dMdt(N[i], M[i], D[i]);
    let derivD = dDdt(M[i], D[i]);
    
    N[i + 1] = N[i] + h * derivN;
    M[i + 1] = M[i] + h * derivM;
    D[i + 1] = D[i] + h * derivD;
    
    if (N[i + 1] < 0) N[i + 1] = 0;
    if (M[i + 1] < 0) M[i + 1] = 0;
    if (D[i + 1] < 0) D[i + 1] = 0;
    
    if (i % 10 === 0 || i === n - 1) {
      pasos.push({
        paso: i + 1,
        t: t[i + 1],
        N: N[i + 1],
        M: M[i + 1],
        D: D[i + 1],
        derivN, derivM, derivD
      });
    }
  }
  
  mostrarResultadosEulerSocial(pasos, t, N, M, D, n, a, b, c, k, r, h);
}

function mostrarResultadosEulerSocial(pasos, t, N, M, D, n, a, b, c, k, r, h) {
  document.getElementById("resultadosCard").style.display = "block";
  document.getElementById("resultadosTitle").innerHTML = "👥 Difusión social - Método de Euler";
  
  document.getElementById("tablaHead").innerHTML = `
    <tr><th>Paso</th><th>t (días)</th><th>Neutrales (N)</th><th>Manifestantes (M)</th><th>Mediadores (D)</th><th>dN/dt</th><th>dM/dt</th><th>dD/dt</th></tr>
  `;
  
  const tbody = document.getElementById("tablaBody");
  tbody.innerHTML = "";
  
  for (let p of pasos) {
    tbody.innerHTML += `
      <tr>
        <td>${p.paso}</td>
        <td>${p.t.toFixed(2)}</td>
        <td>${p.N.toFixed(1)}</td>
        <td>${p.M.toFixed(1)}</td>
        <td>${p.D.toFixed(1)}</td>
        <td>${p.derivN.toFixed(3)}</td>
        <td>${p.derivM.toFixed(3)}</td>
        <td>${p.derivD.toFixed(3)}</td>
      </tr>
    `;
  }
  
  const finalN = N[n];
  const finalM = M[n];
  const finalD = D[n];
  const maxM = Math.max(...M);
  const diaMax = t[M.indexOf(maxM)];
  
  let estado = "";
  let interpretacion = "";
  
  if (finalM < 10) {
    estado = "✅ ESTABLE";
    interpretacion = "El conflicto se ha disuelto casi por completo. Los mediadores lograron reducir la protesta a niveles mínimos.";
  } else if (finalM < 50) {
    estado = "⚠️ CONTROLADO";
    interpretacion = "Hay manifestación residual, pero bajo control. Se necesita mantener el diálogo para evitar rebrotes.";
  } else {
    estado = "🔴 CRÍTICO";
    interpretacion = "El conflicto persiste con niveles significativos. Los mediadores no están siendo efectivos. Se requiere intervención urgente.";
  }
  
  document.getElementById("resultadoFinal").innerHTML = `
    <div class="resultado-valor">${estado}</div>
    <div class="resultado-detalle">
      <p>📊 <strong>Resultados finales:</strong></p>
      <p>• Neutrales: ${finalN.toFixed(1)} | Manifestantes: ${finalM.toFixed(1)} | Mediadores: ${finalD.toFixed(1)}</p>
      <p>📈 <strong>Máximo de manifestantes:</strong> ${maxM.toFixed(1)} (día ${diaMax.toFixed(2)})</p>
    </div>
  `;
  
  document.getElementById("interpretacionEuler").innerHTML = `
    <p><strong>📖 Interpretación del resultado:</strong></p>
    <p>${interpretacion}</p>
    <p><strong>🔍 Parámetros del modelo:</strong> a=${a} (influencia), b=${b} (recuperación), c=${c} (diálogo), k=${k} (reacción), r=${r} (desgaste)</p>
    <p><strong>⚠️ Precisión del método:</strong> Euler tiene error O(h)=${h.toFixed(2)}. Para mayor precisión, usar Heun o RK4.</p>
  `;
  
  // Gráfica
  const ctx = document.getElementById("graficoEuler").getContext("2d");
  if (chartEuler) chartEuler.destroy();
  
  chartEuler = new Chart(ctx, {
    type: 'line',
    data: {
      labels: t.map(v => v.toFixed(1)),
      datasets: [
        { label: 'Neutrales (N)', data: N, borderColor: '#3498db', borderWidth: 2, fill: false },
        { label: 'Manifestantes (M)', data: M, borderColor: '#e74c3c', borderWidth: 2, fill: false },
        { label: 'Mediadores (D)', data: D, borderColor: '#2ecc71', borderWidth: 2, fill: false }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: { legend: { labels: { color: '#e0e0e0' } } },
      scales: {
        y: { title: { display: true, text: 'Personas', color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true },
        x: { title: { display: true, text: 'Tiempo (días)', color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
      }
    }
  });
}

// ==================== EVENTOS ====================
document.addEventListener("DOMContentLoaded", () => {
  // Pestañas de escenarios
  document.querySelectorAll(".scenario-tab").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".scenario-tab").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      const scenario = btn.dataset.scenario;
      document.getElementById("eulerReservas").classList.remove("active");
      document.getElementById("eulerSocial").classList.remove("active");
      
      if (scenario === "reservas") {
        document.getElementById("eulerReservas").classList.add("active");
      } else {
        document.getElementById("eulerSocial").classList.add("active");
      }
      
      document.getElementById("resultadosCard").style.display = "none";
    });
  });
  
  document.getElementById("btnCalcularEulerReservas").addEventListener("click", calcularEulerReservas);
  document.getElementById("btnCalcularEulerSocial").addEventListener("click", calcularEulerSocial);
});