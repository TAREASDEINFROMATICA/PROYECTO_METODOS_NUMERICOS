let chartRK4 = null;

function calcularRK4Reservas() {
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
    let k2 = dRdt(R[i] + (h/2) * k1);
    let k3 = dRdt(R[i] + (h/2) * k2);
    let k4 = dRdt(R[i] + h * k3);
    R[i + 1] = R[i] + (h/6) * (k1 + 2*k2 + 2*k3 + k4);
    if (R[i + 1] < 0) R[i + 1] = 0;
    pasos.push({ paso: i+1, t: t[i], R_actual: R[i], k1, k2, k3, k4, R_siguiente: R[i+1] });
  }
  
  let diaCritico = -1;
  for (let i = 0; i <= n; i++) if (R[i] <= 0) { diaCritico = t[i]; break; }
  
  document.getElementById("resultadosCard").style.display = "block";
  document.getElementById("resultadosTitle").innerHTML = "⛽ Vaciado de reservas - RK4 (más preciso)";
  document.getElementById("tablaHead").innerHTML = `<tr><th>Paso</th><th>t</th><th>R actual</th><th>k₁</th><th>k₂</th><th>k₃</th><th>k₄</th><th>R siguiente</th></tr>`;
  
  const tbody = document.getElementById("tablaBody");
  tbody.innerHTML = "";
  for (let i = 0; i < pasos.length; i += Math.ceil(pasos.length / 10)) {
    const p = pasos[i];
    tbody.innerHTML += `<tr><td>${p.paso}</td><td>${p.t.toFixed(2)}</td><td>${p.R_actual.toFixed(2)}</td><td>${p.k1.toFixed(2)}</td><td>${p.k2.toFixed(2)}</td><td>${p.k3.toFixed(2)}</td><td>${p.k4.toFixed(2)}</td><td>${p.R_siguiente.toFixed(2)}</td></tr>`;
  }
  
  document.getElementById("resultadoFinal").innerHTML = `<div class="resultado-valor">Reserva final: ${R[n].toFixed(2)} L</div><div class="resultado-detalle"><p>📊 Día crítico: ${diaCritico !== -1 ? diaCritico.toFixed(2) : "Nunca"} días</p><p>⭐ RK4 es el método más preciso (error O(h⁴) = ${Math.pow(h,4).toFixed(6)})</p></div>`;
  document.getElementById("interpretacionRK4").innerHTML = `<p><strong>📖 Interpretación:</strong> ${diaCritico !== -1 ? `Con RK4 (máxima precisión), la reserva se agota en ${diaCritico.toFixed(2)} días.` : "La reserva es estable."} Se recomienda RK4 para simulaciones críticas.</p>`;
  
  const ctx = document.getElementById("graficoRK4").getContext("2d");
  if (chartRK4) chartRK4.destroy();
  chartRK4 = new Chart(ctx, { type: 'line', data: { labels: t.map(v => v.toFixed(1)), datasets: [{ label: 'Reserva (RK4)', data: R, borderColor: '#a78bfa', borderWidth: 3, fill: true }] }, options: { responsive: true, scales: { y: { beginAtZero: true } } } });
}

function calcularRK4Social() {
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
    let y = [N[i], M[i], D[i]];
    let k1 = sistema(y[0], y[1], y[2]);
    let k2 = sistema(y[0] + (h/2)*k1[0], y[1] + (h/2)*k1[1], y[2] + (h/2)*k1[2]);
    let k3 = sistema(y[0] + (h/2)*k2[0], y[1] + (h/2)*k2[1], y[2] + (h/2)*k2[2]);
    let k4 = sistema(y[0] + h*k3[0], y[1] + h*k3[1], y[2] + h*k3[2]);
    N[i+1] = y[0] + (h/6)*(k1[0] + 2*k2[0] + 2*k3[0] + k4[0]);
    M[i+1] = y[1] + (h/6)*(k1[1] + 2*k2[1] + 2*k3[1] + k4[1]);
    D[i+1] = y[2] + (h/6)*(k1[2] + 2*k2[2] + 2*k3[2] + k4[2]);
    if (N[i+1] < 0) N[i+1] = 0;
    if (M[i+1] < 0) M[i+1] = 0;
    if (D[i+1] < 0) D[i+1] = 0;
  }
  
  const finalM = M[n];
  let estado = finalM < 10 ? "✅ ESTABLE" : (finalM < 50 ? "⚠️ CONTROLADO" : "🔴 CRÍTICO");
  
  document.getElementById("resultadosCard").style.display = "block";
  document.getElementById("resultadosTitle").innerHTML = "👥 Difusión social - RK4 (máxima precisión)";
  document.getElementById("resultadoFinal").innerHTML = `<div class="resultado-valor">${estado}</div><div class="resultado-detalle"><p>Neutrales: ${N[n].toFixed(1)} | Manifestantes: ${M[n].toFixed(1)} | Mediadores: ${D[n].toFixed(1)}</p><p>⭐ RK4 es el método más preciso (error O(h⁴))</p></div>`;
  document.getElementById("interpretacionRK4").innerHTML = `<p><strong>📖 Interpretación:</strong> Usando RK4 (máxima precisión), el sistema ${finalM < 10 ? "se estabiliza" : (finalM < 50 ? "está controlado pero persiste" : "sigue en crisis")}. Se recomienda RK4 para análisis críticos.</p>`;
  
  const ctx = document.getElementById("graficoRK4").getContext("2d");
  if (chartRK4) chartRK4.destroy();
  chartRK4 = new Chart(ctx, { type: 'line', data: { labels: t.map(v => v.toFixed(1)), datasets: [{ label: 'Manifestantes (RK4)', data: M, borderColor: '#a78bfa', borderWidth: 3 }, { label: 'Neutrales', data: N, borderColor: '#3498db' }, { label: 'Mediadores', data: D, borderColor: '#2ecc71' }] }, options: { responsive: true } });
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".scenario-tab").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".scenario-tab").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const scenario = btn.dataset.scenario;
      document.getElementById("rk4Reservas").classList.toggle("active", scenario === "reservas");
      document.getElementById("rk4Social").classList.toggle("active", scenario === "social");
      document.getElementById("resultadosCard").style.display = "none";
    });
  });
  document.getElementById("btnCalcularRK4Reservas").addEventListener("click", calcularRK4Reservas);
  document.getElementById("btnCalcularRK4Social").addEventListener("click", calcularRK4Social);
});