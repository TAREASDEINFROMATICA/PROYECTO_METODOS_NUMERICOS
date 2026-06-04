let chartReservas = null;
let chartSocial = null;

// ==================== ESCENARIO B: RESERVAS ====================
function simularReservas(metodo) {
  const R0 = parseFloat(document.getElementById("reservaInicial").value);
  const consumoBase = parseFloat(document.getElementById("consumoBase").value);
  const entradaBase = parseFloat(document.getElementById("entradaBase").value);
  const factorPanicoBase = parseFloat(document.getElementById("factorPanico").value);
  const dias = parseFloat(document.getElementById("diasReservas").value);
  const h = parseFloat(document.getElementById("dtReservas").value);
  const n = Math.ceil(dias / h);
  
  const caso = document.querySelector('input[name="casoReservas"]:checked').value;
  
  let consumo, entrada, factorPanico, colorCaso;
  if (caso === "ideal") {
    consumo = consumoBase;
    entrada = entradaBase;
    factorPanico = 0;
    colorCaso = "#27ae60";
  } else if (caso === "moderado") {
    consumo = consumoBase * 1.5;
    entrada = entradaBase * 0.7;
    factorPanico = 0;
    colorCaso = "#e67e22";
  } else {
    consumo = consumoBase * 2;
    entrada = entradaBase * 0.5;
    factorPanico = factorPanicoBase;
    colorCaso = "#e74c3c";
  }
  
  function dRdt(R, t) {
    let cons = consumo;
    if (caso === "critico" && R < R0 * 0.5) {
      cons = consumo * (1 + factorPanico);
    }
    return entrada - cons;
  }
  
  let t = Array(n + 1).fill(0);
  let R = Array(n + 1).fill(0);
  R[0] = R0;
  
  for (let i = 0; i < n; i++) {
    t[i + 1] = t[i] + h;
    
    if (metodo === "euler") {
      R[i + 1] = R[i] + h * dRdt(R[i], t[i]);
    } else if (metodo === "heun") {
      let k1 = dRdt(R[i], t[i]);
      let k2 = dRdt(R[i] + h * k1, t[i] + h);
      R[i + 1] = R[i] + (h / 2) * (k1 + k2);
    } else { // RK4
      let k1 = dRdt(R[i], t[i]);
      let k2 = dRdt(R[i] + (h/2) * k1, t[i] + h/2);
      let k3 = dRdt(R[i] + (h/2) * k2, t[i] + h/2);
      let k4 = dRdt(R[i] + h * k3, t[i] + h);
      R[i + 1] = R[i] + (h/6) * (k1 + 2*k2 + 2*k3 + k4);
    }
    if (R[i + 1] < 0) R[i + 1] = 0;
  }
  
  let diaCritico = R.findIndex(v => v <= 0) * h;
  if (diaCritico <= 0 || diaCritico > dias) diaCritico = null;
  
  let nombreCaso = caso === "ideal" ? "Ideal" : (caso === "moderado" ? "Moderado" : "Crítico");
  let metodoNombre = metodo === "euler" ? "Euler" : (metodo === "heun" ? "Heun" : "RK4");
  
  let resultadoHtml = `
    <div class="resultado-valor-grande" style="color: ${colorCaso};">${R[n].toFixed(0)} litros</div>
    <p><strong>Reserva final después de ${dias} días</strong></p>
    <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 0.5rem;">
      <div style="background: rgba(0,0,0,0.05); padding: 0.3rem 0.8rem; border-radius: 20px;">📉 Consumo: ${consumo} L/día</div>
      <div style="background: rgba(0,0,0,0.05); padding: 0.3rem 0.8rem; border-radius: 20px;">📈 Entrada: ${entrada} L/día</div>
      ${diaCritico ? `<div style="background: #e74c3c20; padding: 0.3rem 0.8rem; border-radius: 20px; color: #e74c3c;">⚠️ Nivel crítico: día ${diaCritico.toFixed(1)}</div>` : '<div style="background: #27ae6020; padding: 0.3rem 0.8rem; border-radius: 20px; color: #27ae60;">✅ Sin nivel crítico</div>'}
    </div>
  `;
  
  document.getElementById(`reservas${metodo.charAt(0).toUpperCase() + metodo.slice(1)}Resultado`).innerHTML = resultadoHtml;
  document.getElementById(`resultadoReservas${metodo.charAt(0).toUpperCase() + metodo.slice(1)}`).style.display = "block";
  
  // Actualizar gráfica
  if (chartReservas) chartReservas.destroy();
  const ctx = document.getElementById("graficoReservas").getContext("2d");
  chartReservas = new Chart(ctx, {
    type: 'line',
    data: {
      labels: t.map(v => v.toFixed(1)),
      datasets: [{ label: `${metodoNombre} - Caso ${nombreCaso}`, data: R, borderColor: colorCaso, backgroundColor: `${colorCaso}20`, borderWidth: 2, fill: true, tension: 0.3 }]
    },
    options: { responsive: true, plugins: { legend: { labels: { color: '#4a3b7c' } } }, scales: { y: { beginAtZero: true, title: { text: 'Litros' } }, x: { title: { text: 'Días' } } } }
  });
  document.getElementById("graficoReservasContainer").style.display = "block";
}

// ==================== ESCENARIO G: DIFUSIÓN SOCIAL ====================
function simularSocial(metodo) {
  const N0 = parseFloat(document.getElementById("neutrales0").value);
  const M0 = parseFloat(document.getElementById("manifestantes0").value);
  const D0 = parseFloat(document.getElementById("mediadores0").value);
  const a_base = parseFloat(document.getElementById("tasaInfluencia").value);
  const b_base = parseFloat(document.getElementById("tasaRecuperacion").value);
  const c_base = parseFloat(document.getElementById("efectividadDialogo").value);
  const k_base = parseFloat(document.getElementById("reaccionInstitucional").value);
  const r_base = parseFloat(document.getElementById("desgasteMediadores").value);
  const dias = parseFloat(document.getElementById("diasSocial").value);
  const h = parseFloat(document.getElementById("dtSocial").value);
  const n = Math.ceil(dias / h);
  
  const caso = document.querySelector('input[name="casoSocial"]:checked').value;
  
  let a, b, c, k, r, colorCaso;
  if (caso === "ideal") {
    a = a_base * 0.5; b = b_base * 1.5; c = c_base * 1.5; k = k_base * 1.5; r = r_base * 0.7;
    colorCaso = "#27ae60";
  } else if (caso === "moderado") {
    a = a_base * 1.2; b = b_base * 0.8; c = c_base * 0.7; k = k_base * 0.8; r = r_base * 1.2;
    colorCaso = "#e67e22";
  } else {
    a = a_base * 2; b = b_base * 0.5; c = c_base * 0.3; k = k_base * 0.4; r = r_base * 1.8;
    colorCaso = "#e74c3c";
  }
  
  function sistema(y) {
    let [N, M, D] = y;
    return [-a * N * M + b * D, a * N * M - c * M * D, k * M - r * D];
  }
  
  let t = Array(n + 1).fill(0);
  let N_arr = Array(n + 1).fill(0), M_arr = Array(n + 1).fill(0), D_arr = Array(n + 1).fill(0);
  N_arr[0] = N0; M_arr[0] = M0; D_arr[0] = D0;
  
  for (let i = 0; i < n; i++) {
    t[i + 1] = t[i] + h;
    let y = [N_arr[i], M_arr[i], D_arr[i]];
    
    if (metodo === "euler") {
      let deriv = sistema(y);
      N_arr[i+1] = y[0] + h * deriv[0];
      M_arr[i+1] = y[1] + h * deriv[1];
      D_arr[i+1] = y[2] + h * deriv[2];
    } else if (metodo === "heun") {
      let k1 = sistema(y);
      let y_pred = [y[0] + h*k1[0], y[1] + h*k1[1], y[2] + h*k1[2]];
      let k2 = sistema(y_pred);
      N_arr[i+1] = y[0] + (h/2)*(k1[0] + k2[0]);
      M_arr[i+1] = y[1] + (h/2)*(k1[1] + k2[1]);
      D_arr[i+1] = y[2] + (h/2)*(k1[2] + k2[2]);
    } else { // RK4
      let k1 = sistema(y);
      let k2 = sistema([y[0] + (h/2)*k1[0], y[1] + (h/2)*k1[1], y[2] + (h/2)*k1[2]]);
      let k3 = sistema([y[0] + (h/2)*k2[0], y[1] + (h/2)*k2[1], y[2] + (h/2)*k2[2]]);
      let k4 = sistema([y[0] + h*k3[0], y[1] + h*k3[1], y[2] + h*k3[2]]);
      N_arr[i+1] = y[0] + (h/6)*(k1[0] + 2*k2[0] + 2*k3[0] + k4[0]);
      M_arr[i+1] = y[1] + (h/6)*(k1[1] + 2*k2[1] + 2*k3[1] + k4[1]);
      D_arr[i+1] = y[2] + (h/6)*(k1[2] + 2*k2[2] + 2*k3[2] + k4[2]);
    }
    
    if (N_arr[i+1] < 0) N_arr[i+1] = 0;
    if (M_arr[i+1] < 0) M_arr[i+1] = 0;
    if (D_arr[i+1] < 0) D_arr[i+1] = 0;
  }
  
  let maxM = Math.max(...M_arr);
  let diaMax = t[M_arr.indexOf(maxM)];
  let estado = M_arr[n] < 10 ? "✅ ESTABLE" : (M_arr[n] < 50 ? "⚠️ CONTROLADO" : "🔴 CRÍTICO");
  let estadoColor = M_arr[n] < 10 ? "#27ae60" : (M_arr[n] < 50 ? "#e67e22" : "#e74c3c");
  
  let nombreCaso = caso === "ideal" ? "Calma" : (caso === "moderado" ? "Tensión" : "Crisis");
  let metodoNombre = metodo === "euler" ? "Euler" : (metodo === "heun" ? "Heun" : "RK4");
  
  let resultadoHtml = `
    <div style="display: flex; gap: 1rem; flex-wrap: wrap; justify-content: space-between;">
      <div><strong>👥 Neutrales finales:</strong> ${N_arr[n].toFixed(0)}</div>
      <div><strong>✊ Manifestantes finales:</strong> <span style="color: ${estadoColor};">${M_arr[n].toFixed(0)}</span></div>
      <div><strong>🤝 Mediadores finales:</strong> ${D_arr[n].toFixed(0)}</div>
    </div>
    <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 0.5rem;">
      <div style="background: rgba(0,0,0,0.05); padding: 0.3rem 0.8rem; border-radius: 20px;">📊 Máximo manifestantes: ${maxM.toFixed(0)} (día ${diaMax.toFixed(1)})</div>
      <div style="background: ${estadoColor}20; padding: 0.3rem 0.8rem; border-radius: 20px; color: ${estadoColor};">${estado}</div>
    </div>
    <div style="margin-top: 0.5rem; font-size: 0.8rem; color: #7a7596;">
      📈 Parámetros: a=${a.toFixed(4)} | b=${b.toFixed(2)} | c=${c.toFixed(4)} | k=${k.toFixed(2)} | r=${r.toFixed(2)}
    </div>
  `;
  
  document.getElementById(`social${metodo.charAt(0).toUpperCase() + metodo.slice(1)}Resultado`).innerHTML = resultadoHtml;
  document.getElementById(`resultadoSocial${metodo.charAt(0).toUpperCase() + metodo.slice(1)}`).style.display = "block";
  
  // Actualizar gráfica
  if (chartSocial) chartSocial.destroy();
  const ctx = document.getElementById("graficoSocial").getContext("2d");
  chartSocial = new Chart(ctx, {
    type: 'line',
    data: {
      labels: t.map(v => v.toFixed(1)),
      datasets: [
        { label: 'Neutrales', data: N_arr, borderColor: '#4a3b7c', backgroundColor: 'transparent', borderWidth: 2, tension: 0.3 },
        { label: 'Manifestantes', data: M_arr, borderColor: colorCaso, backgroundColor: 'transparent', borderWidth: 3, tension: 0.3 },
        { label: 'Mediadores', data: D_arr, borderColor: '#27ae60', backgroundColor: 'transparent', borderWidth: 2, tension: 0.3 }
      ]
    },
    options: { responsive: true, plugins: { legend: { labels: { color: '#4a3b7c' } } }, scales: { y: { beginAtZero: true, title: { text: 'Personas' } }, x: { title: { text: 'Días' } } } }
  });
  document.getElementById("graficoSocialContainer").style.display = "block";
}

// ==================== EVENTOS ====================
document.addEventListener("DOMContentLoaded", () => {
  // Selector de escenarios
  document.querySelectorAll(".escenario-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".escenario-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const scenario = btn.dataset.escenario;
      document.getElementById("panelReservas").classList.remove("active");
      document.getElementById("panelSocial").classList.remove("active");
      if (scenario === "reservas") {
        document.getElementById("panelReservas").classList.add("active");
      } else {
        document.getElementById("panelSocial").classList.add("active");
      }
    });
  });
  
  // Botones para RESERVAS
  document.getElementById("btnEulerReservas").addEventListener("click", () => simularReservas("euler"));
  document.getElementById("btnHeunReservas").addEventListener("click", () => simularReservas("heun"));
  document.getElementById("btnRK4Reservas").addEventListener("click", () => simularReservas("rk4"));
  
  // Botones para SOCIAL
  document.getElementById("btnEulerSocial").addEventListener("click", () => simularSocial("euler"));
  document.getElementById("btnHeunSocial").addEventListener("click", () => simularSocial("heun"));
  document.getElementById("btnRK4Social").addEventListener("click", () => simularSocial("rk4"));
  
  // Ejecutar simulaciones por defecto
  simularReservas("rk4");
  simularSocial("rk4");
});