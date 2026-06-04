let chart = null;

// Función para actualizar los valores mostrados en el panel cuando cambia el caso
function actualizarValoresPanel() {
  const caso = document.querySelector('input[name="caso"]:checked').value;
  const consumoBase = 600;
  const entradaBase = 500;
  
  let consumo, entrada, balance, panico, colorClass;
  
  if (caso === "ideal") {
    consumo = consumoBase;
    entrada = entradaBase;
    balance = entrada - consumo;
    panico = 0;
    colorClass = "valor-ideal";
  } else if (caso === "moderado") {
    consumo = consumoBase * 1.5;
    entrada = entradaBase * 0.7;
    balance = entrada - consumo;
    panico = 0;
    colorClass = "valor-moderado";
  } else {
    consumo = consumoBase * 2;
    entrada = entradaBase * 0.5;
    balance = entrada - consumo;
    panico = 50;
    colorClass = "valor-critico";
  }
  
  document.getElementById("consumoActual").innerHTML = consumo;
  document.getElementById("consumoActual").className = `valor-destacado ${colorClass}`;
  document.getElementById("entradaActual").innerHTML = entrada;
  document.getElementById("entradaActual").className = `valor-destacado ${colorClass}`;
  document.getElementById("balanceActual").innerHTML = balance;
  document.getElementById("balanceActual").className = `valor-destacado ${balance < 0 ? 'valor-critico' : 'valor-ideal'}`;
  document.getElementById("panicoActual").innerHTML = panico;
  
  // Cambiar el color del panel según el caso
  const panel = document.getElementById("panelValoresActuales");
  if (caso === "ideal") {
    panel.style.borderLeftColor = "#27ae60";
    panel.style.background = "linear-gradient(135deg, #27ae6010, #e8e0f8)";
  } else if (caso === "moderado") {
    panel.style.borderLeftColor = "#e67e22";
    panel.style.background = "linear-gradient(135deg, #e67e2210, #e8e0f8)";
  } else {
    panel.style.borderLeftColor = "#e74c3c";
    panel.style.background = "linear-gradient(135deg, #e74c3c10, #e8e0f8)";
  }
}

// Función principal de simulación
function simular(metodo) {
  const R0 = parseFloat(document.getElementById("reservaInicial").value);
  const consumoBase = parseFloat(document.getElementById("consumoBase").value);
  const entradaBase = parseFloat(document.getElementById("entradaBase").value);
  const factorPanico = parseFloat(document.getElementById("factorPanico").value);
  const dias = parseFloat(document.getElementById("dias").value);
  const h = parseFloat(document.getElementById("dt").value);
  const n = Math.ceil(dias / h);
  
  const caso = document.querySelector('input[name="caso"]:checked').value;
  
  let consumo, entrada, colorCaso, nombreCaso, descripcionCaso;
  if (caso === "ideal") {
    consumo = consumoBase;
    entrada = entradaBase;
    colorCaso = "#27ae60";
    nombreCaso = "Ideal";
    descripcionCaso = "Situación normal: el consumo supera ligeramente a la entrada. La reserva disminuye lentamente.";
  } else if (caso === "moderado") {
    consumo = consumoBase * 1.5;
    entrada = entradaBase * 0.7;
    colorCaso = "#e67e22";
    nombreCaso = "Moderado";
    descripcionCaso = "Crisis moderada: el consumo aumenta un 50% y la entrada disminuye un 30%. La reserva se agota rápidamente.";
  } else {
    consumo = consumoBase * 2;
    entrada = entradaBase * 0.5;
    colorCaso = "#e74c3c";
    nombreCaso = "Crítico";
    descripcionCaso = "Crisis crítica: el consumo se duplica y la entrada se reduce a la mitad. Además, hay pánico cuando la reserva baja del 50%.";
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
    } else {
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
  
  let metodoNombre = metodo === "euler" ? "Euler" : (metodo === "heun" ? "Heun" : "RK4");
  let metodoError = metodo === "euler" ? "O(h)" : (metodo === "heun" ? "O(h²)" : "O(h⁴)");
  
  let resultadoHtml = `
    <div class="resultado-valor" style="color: ${colorCaso};">${R[n].toFixed(0)} litros</div>
    <p><strong>Reserva final después de ${dias} días</strong></p>
    <div style="display: flex; gap: 0.8rem; flex-wrap: wrap; margin-top: 0.5rem;">
      <span style="background: rgba(0,0,0,0.05); padding: 0.2rem 0.8rem; border-radius: 20px;">📉 Consumo: ${consumo} L/día</span>
      <span style="background: rgba(0,0,0,0.05); padding: 0.2rem 0.8rem; border-radius: 20px;">📈 Entrada: ${entrada} L/día</span>
      <span style="background: rgba(0,0,0,0.05); padding: 0.2rem 0.8rem; border-radius: 20px;">⚖️ Balance: ${(entrada - consumo).toFixed(0)} L/día</span>
      ${diaCritico ? `<span style="background: #e74c3c20; padding: 0.2rem 0.8rem; border-radius: 20px; color: #e74c3c;">⚠️ Día crítico: ${diaCritico.toFixed(1)}</span>` : '<span style="background: #27ae6020; padding: 0.2rem 0.8rem; border-radius: 20px; color: #27ae60;">✅ Sin nivel crítico</span>'}
    </div>
    <p style="margin-top: 0.8rem; font-size: 0.85rem; color: #7a7596;">
      🔍 <strong>Método de ${metodoNombre}</strong> (Error ${metodoError})<br>
      ${descripcionCaso}
    </p>
  `;
  
  document.getElementById(`${metodo}Resultado`).innerHTML = resultadoHtml;
  document.getElementById(`resultado${metodo.charAt(0).toUpperCase() + metodo.slice(1)}`).style.display = "block";
  
  if (chart) chart.destroy();
  const ctx = document.getElementById("grafico").getContext("2d");
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: t.map(v => v.toFixed(1)),
      datasets: [{
        label: `${metodoNombre} - Caso ${nombreCaso}`,
        data: R,
        borderColor: colorCaso,
        backgroundColor: `${colorCaso}20`,
        borderWidth: 3,
        fill: true,
        tension: 0.3,
        pointRadius: 2
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: '#4a3b7c' } } },
      scales: { y: { beginAtZero: true, title: { text: 'Litros' } }, x: { title: { text: 'Días' } } }
    }
  });
  document.getElementById("graficoContainer").style.display = "block";
  
  actualizarInterpretacion(caso, R[n], diaCritico, consumo, entrada);
  actualizarComparacionCasos();
}

function actualizarInterpretacion(caso, reservaFinal, diaCritico, consumo, entrada) {
  const interpretacionDiv = document.getElementById("interpretacionFinal");
  const perdidaDiaria = consumo - entrada;
  const porcentajePerdida = (perdidaDiaria / entrada) * 100;
  
  let texto = "";
  if (caso === "ideal") {
    texto = `
      <p><strong><i class="fas fa-chart-line"></i> Análisis del caso IDEAL:</strong></p>
      <p>La reserva final es de <strong>${reservaFinal.toFixed(0)} litros</strong> después de 30 días.</p>
      <p>📊 <strong>Análisis matemático:</strong> En situación normal, el consumo (${consumo} L/día) supera a la entrada (${entrada} L/día) en ${perdidaDiaria} L/día (${porcentajePerdida.toFixed(0)}% de pérdida).</p>
      <p>💡 <strong>Interpretación económica:</strong> Esta pérdida equivale a aproximadamente <strong>${(perdidaDiaria * 30).toFixed(0)} litros al mes</strong>. Aunque es manejable, se recomienda ajustar el consumo o aumentar la entrada a largo plazo.</p>
      ${diaCritico ? `<p>⚠️ La reserva se agotaría en <strong>${diaCritico.toFixed(1)} días</strong> si la tendencia continúa.</p>` : '<p>✅ La reserva no llegó a niveles críticos en el período simulado.</p>'}
    `;
  } else if (caso === "moderado") {
    texto = `
      <p><strong><i class="fas fa-chart-line"></i> Análisis del caso MODERADO:</strong></p>
      <p>La reserva final es de <strong>${reservaFinal.toFixed(0)} litros</strong> después de 30 días.</p>
      <p>📊 <strong>Análisis matemático:</strong> En crisis moderada, el consumo aumenta un 50% (${consumo} L/día) y la entrada disminuye un 30% (${entrada} L/día). La pérdida diaria es de ${perdidaDiaria} L/día (${porcentajePerdida.toFixed(0)}%).</p>
      <p>💡 <strong>Interpretación económica:</strong> ¡La pérdida mensual sería de <strong>${(perdidaDiaria * 30).toFixed(0)} litros</strong>! Se requieren medidas urgentes para controlar la demanda.</p>
      ${diaCritico ? `<p>🔴 <strong>ALERTA:</strong> La reserva llegaría a nivel crítico en <strong>${diaCritico.toFixed(1)} días</strong>. ¡Tiempo límite para actuar!</p>` : '<p>⚠️ La situación es delicada, se necesita monitoreo constante.</p>'}
    `;
  } else {
    texto = `
      <p><strong><i class="fas fa-chart-line"></i> Análisis del caso CRÍTICO:</strong></p>
      <p>La reserva final es de <strong>${reservaFinal.toFixed(0)} litros</strong> después de 30 días.</p>
      <p>📊 <strong>Análisis matemático:</strong> En crisis crítica, el consumo se duplica (${consumo} L/día) y la entrada se reduce a la mitad (${entrada} L/día). La pérdida diaria es de ${perdidaDiaria} L/día (${porcentajePerdida.toFixed(0)}% de pérdida).</p>
      <p>💡 <strong>Interpretación económica:</strong> ¡ESTO ES UNA EMERGENCIA NACIONAL! Por cada litro que entra, se consumen ${(consumo/entrada).toFixed(1)} litros. La pérdida mensual sería de <strong style="color:#e74c3c;">${(perdidaDiaria * 30).toFixed(0)} litros</strong>.</p>
      ${diaCritico ? `<p>🔴🔴🔴 <strong>CRISIS INMINENTE:</strong> La reserva se agotará en <strong>${diaCritico.toFixed(1)} días</strong> si no se toman medidas inmediatas: racionamiento, control de precios y apertura de rutas de abastecimiento.</p>` : '<p>🔴 La situación es extremadamente crítica.</p>'}
    `;
  }
  interpretacionDiv.innerHTML = texto;
}

function actualizarComparacionCasos() {
  const R0 = parseFloat(document.getElementById("reservaInicial").value);
  const consumoBase = parseFloat(document.getElementById("consumoBase").value);
  const entradaBase = parseFloat(document.getElementById("entradaBase").value);
  const factorPanico = parseFloat(document.getElementById("factorPanico").value);
  const dias = parseFloat(document.getElementById("dias").value);
  const h = parseFloat(document.getElementById("dt").value);
  const n = Math.ceil(dias / h);
  
  const casos = ["ideal", "moderado", "critico"];
  const nombres = ["📈 Ideal", "⚠️ Moderado", "🔥 Crítico"];
  const colores = ["#27ae60", "#e67e22", "#e74c3c"];
  const detalles = [
    "Consumo: 600 L/día | Entrada: 500 L/día | Balance: -100 L/día",
    "Consumo: 900 L/día | Entrada: 350 L/día | Balance: -550 L/día",
    "Consumo: 1200 L/día | Entrada: 250 L/día | Balance: -950 L/día + pánico"
  ];
  
  let resultados = [];
  
  for (let idx = 0; idx < casos.length; idx++) {
    let caso = casos[idx];
    let consumo, entrada;
    
    if (caso === "ideal") {
      consumo = consumoBase;
      entrada = entradaBase;
    } else if (caso === "moderado") {
      consumo = consumoBase * 1.5;
      entrada = entradaBase * 0.7;
    } else {
      consumo = consumoBase * 2;
      entrada = entradaBase * 0.5;
    }
    
    function dRdtComparar(R, t, casoType) {
      let cons = consumo;
      if (casoType === "critico" && R < R0 * 0.5) {
        cons = consumo * (1 + factorPanico);
      }
      return entrada - cons;
    }
    
    let t_arr = Array(n + 1).fill(0);
    let R_arr = Array(n + 1).fill(0);
    R_arr[0] = R0;
    
    for (let i = 0; i < n; i++) {
      t_arr[i + 1] = t_arr[i] + h;
      let k1 = dRdtComparar(R_arr[i], t_arr[i], caso);
      let k2 = dRdtComparar(R_arr[i] + (h/2) * k1, t_arr[i] + h/2, caso);
      let k3 = dRdtComparar(R_arr[i] + (h/2) * k2, t_arr[i] + h/2, caso);
      let k4 = dRdtComparar(R_arr[i] + h * k3, t_arr[i] + h, caso);
      R_arr[i + 1] = R_arr[i] + (h/6) * (k1 + 2*k2 + 2*k3 + k4);
      if (R_arr[i + 1] < 0) R_arr[i + 1] = 0;
    }
    
    let diaCritico = R_arr.findIndex(v => v <= 0) * h;
    if (diaCritico <= 0 || diaCritico > dias) diaCritico = null;
    
    resultados.push({
      nombre: nombres[idx],
      color: colores[idx],
      detalle: detalles[idx],
      reservaFinal: R_arr[n],
      diaCritico: diaCritico
    });
  }
  
  let comparacionHtml = `
    <h4 style="margin: 1rem 0 0.5rem;"><i class="fas fa-chart-simple"></i> Comparación entre los 3 casos (usando RK4)</h4>
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
  `;
  
  for (let res of resultados) {
    comparacionHtml += `
      <div style="background: white; border-radius: 16px; padding: 1rem; text-align: center; border-top: 4px solid ${res.color}; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        <h4 style="color: ${res.color};">${res.nombre}</h4>
        <p style="font-size: 0.7rem; margin: 0.3rem 0;">${res.detalle}</p>
        <hr style="margin: 0.5rem 0;">
        <p><strong>Reserva final:</strong> <span style="color: ${res.color}; font-weight:700;">${res.reservaFinal.toFixed(0)} L</span></p>
        ${res.diaCritico ? `<p style="color: #e74c3c;"><strong>⚠️ Día crítico:</strong> ${res.diaCritico.toFixed(1)}</p>` : '<p style="color: #27ae60;"><strong>✅ Sin crisis</strong></p>'}
      </div>
    `;
  }
  
  comparacionHtml += `</div>`;
  comparacionHtml += `
    <div class="comparison-summary" style="margin-top: 1rem;">
      <strong><i class="fas fa-chart-line"></i> Conclusión:</strong><br>
      • <strong>Ideal:</strong> La reserva disminuye lentamente. Hay tiempo para planificar.<br>
      • <strong>Moderado:</strong> La crisis acelera el vaciado. Se requiere intervención en menos de 20 días.<br>
      • <strong>Crítico:</strong> ¡Emergencia! La reserva se agota en menos de 15 días. Acción inmediata necesaria.
    </div>
  `;
  
  document.getElementById("comparacionCasosContainer").innerHTML = comparacionHtml;
}

// ==================== EVENTOS ====================
document.addEventListener("DOMContentLoaded", () => {
  // Actualizar panel cuando cambia el caso
  document.querySelectorAll('input[name="caso"]').forEach(radio => {
    radio.addEventListener("change", () => {
      actualizarValoresPanel();
      actualizarComparacionCasos();
      const metodoActivo = document.querySelector('#resultadoEuler[style*="display: block"], #resultadoHeun[style*="display: block"], #resultadoRK4[style*="display: block"]');
      if (metodoActivo) {
        if (metodoActivo.id === "resultadoEuler") simular("euler");
        else if (metodoActivo.id === "resultadoHeun") simular("heun");
        else simular("rk4");
      } else {
        simular("rk4");
      }
    });
  });
  
  document.getElementById("btnEuler").addEventListener("click", () => simular("euler"));
  document.getElementById("btnHeun").addEventListener("click", () => simular("heun"));
  document.getElementById("btnRK4").addEventListener("click", () => simular("rk4"));
  
  actualizarValoresPanel();
  actualizarComparacionCasos();
  simular("rk4");
});