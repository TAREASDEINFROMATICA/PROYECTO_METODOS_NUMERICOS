let chartHeun = null;

function calcularHeunReservas() {
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
  
  let pasos = [];
  for (let i = 0; i < n; i++) {
    t[i + 1] = t[i] + h;
    let k1 = dRdt(R[i]);
    let predictor = R[i] + h * k1;
    let k2 = dRdt(predictor);
    R[i + 1] = R[i] + (h / 2) * (k1 + k2);
    if (R[i + 1] < 0) R[i + 1] = 0;
    
    pasos.push({ paso: i + 1, t: t[i], R_actual: R[i], k1, predictor, k2, R_siguiente: R[i + 1] });
  }
  
  let diaCritico = -1;
  for (let i = 0; i <= n; i++) if (R[i] <= 0) { diaCritico = t[i]; break; }
  
  mostrarResultadosHeunReservas(pasos, t, R, diaCritico, R0, consumo, entrada, h);
}

function mostrarResultadosHeunReservas(pasos, t, R, diaCritico, R0, consumo, entrada, h) {
  document.getElementById("resultadosCard").style.display = "block";
  document.getElementById("resultadosTitle").innerHTML = "⛽ Vaciado de reservas - Método de Heun";
  document.getElementById("tablaHead").innerHTML = `<tr><th>Paso</th><th>t (días)</th><th>R actual</th><th>k₁ = f(t,R)</th><th>Predictor</th><th>k₂ = f(t+h, predictor)</th><th>R siguiente</th></tr>`;
  
  const tbody = document.getElementById("tablaBody");
  tbody.innerHTML = "";
  for (let i = 0; i < pasos.length; i += Math.ceil(pasos.length / 15)) {
    const p = pasos[i];
    tbody.innerHTML += `<tr><td>${p.paso}</td><td>${p.t.toFixed(2)}</td><td>${p.R_actual.toFixed(2)}</td><td>${p.k1.toFixed(2)}</td><td>${p.predictor.toFixed(2)}</td><td>${p.k2.toFixed(2)}</td><td>${p.R_siguiente.toFixed(2)}</td></tr>`;
  }
  
  document.getElementById("resultadoFinal").innerHTML = `<div class="resultado-valor">Reserva final: ${R[pasos.length].toFixed(2)} L</div><div class="resultado-detalle"><p>📊 Día crítico: ${diaCritico !== -1 ? diaCritico.toFixed(2) : "Nunca"} días</p><p>⛽ Consumo: ${consumo} L/día | 🚚 Entrada: ${entrada} L/día</p></div>`;
  document.getElementById("interpretacionHeun").innerHTML = `<p><strong>📖 Interpretación:</strong> ${diaCritico !== -1 ? `La reserva se agota en ${diaCritico.toFixed(2)} días.` : "La reserva es estable."} Heun es más preciso que Euler (error O(h²)).</p>`;
  
  const ctx = document.getElementById("graficoHeun").getContext("2d");
  if (chartHeun) chartHeun.destroy();
  chartHeun = new Chart(ctx, { type: 'line', data: { labels: t.map(v => v.toFixed(1)), datasets: [{ label: 'Reserva (Heun)', data: R, borderColor: '#e67e22', fill: true }] }, options: { responsive: true, scales: { y: { beginAtZero: true } } } });
}

function calcularHeunSocial() {
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
  let N = Array(n + 1).fill(0), M = Array(n + 1).fill(0), D = Array(n + 1).fill(0);
  N[0] = N0; M[0] = M0; D[0] = D0;
  
  function sistema(Nv, Mv, Dv) { return [-a * Nv * Mv + b * Dv, a * Nv * Mv - c * Mv * Dv, k * Mv - r * Dv]; }
  
  for (let i = 0; i < n; i++) {
    t[i + 1] = t[i] + h;
    let [dN1, dM1, dD1] = sistema(N[i], M[i], D[i]);
    let Np = N[i] + h * dN1, Mp = M[i] + h * dM1, Dp = D[i] + h * dD1;
    let [dN2, dM2, dD2] = sistema(Np, Mp, Dp);
    N[i + 1] = N[i] + (h / 2) * (dN1 + dN2);
    M[i + 1] = M[i] + (h / 2) * (dM1 + dM2);
    D[i + 1] = D[i] + (h / 2) * (dD1 + dD2);
    if (N[i + 1] < 0) N[i + 1] = 0;
    if (M[i + 1] < 0) M[i + 1] = 0;
    if (D[i + 1] < 0) D[i + 1] = 0;
  }
  
  document.getElementById("resultadosCard").style.display = "block";
  document.getElementById("resultadosTitle").innerHTML = "👥 Difusión social - Método de Heun";
  document.getElementById("resultadoFinal").innerHTML = `<div class="resultado-valor">N:${N[n].toFixed(1)} | M:${M[n].toFixed(1)} | D:${D[n].toFixed(1)}</div>`;
  document.getElementById("interpretacionHeun").innerHTML = `<p>Heun mejora la precisión de Euler usando promedio de pendientes. Error O(h²).</p>`;
  
  const ctx = document.getElementById("graficoHeun").getContext("2d");
  if (chartHeun) chartHeun.destroy();
  chartHeun = new Chart(ctx, { type: 'line', data: { labels: t.map(v => v.toFixed(1)), datasets: [{ label: 'Manifestantes (Heun)', data: M, borderColor: '#e74c3c' }] }, options: { responsive: true } });
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".scenario-tab").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".scenario-tab").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const scenario = btn.dataset.scenario;
      document.getElementById("heunReservas").classList.toggle("active", scenario === "reservas");
      document.getElementById("heunSocial").classList.toggle("active", scenario === "social");
      document.getElementById("resultadosCard").style.display = "none";
    });
  });
  document.getElementById("btnCalcularHeunReservas").addEventListener("click", calcularHeunReservas);
  document.getElementById("btnCalcularHeunSocial").addEventListener("click", calcularHeunSocial);
});