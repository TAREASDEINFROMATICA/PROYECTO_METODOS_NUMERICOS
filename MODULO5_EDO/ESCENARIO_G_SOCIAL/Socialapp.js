// ==================== VARIABLES GLOBALES ====================
let chart = null;
let casoActual = "ideal";
let metodoActual = "rk4";

// Valores base de los parámetros
const a_base = 0.008;
const b_base = 0.1;
const c_base = 0.008;
const k_base = 0.3;
const r_base = 0.2;

// ==================== VALORES POR CASO ====================
const valoresCasos = {
  ideal: { 
    a: a_base * 0.5,      // Menor contagio
    b: b_base * 1.5,      // Mayor recuperación
    c: c_base * 1.5,      // Mayor efectividad del diálogo
    k: k_base * 1.5,      // Mayor reacción institucional
    r: r_base * 0.7,      // Menor desgaste
    color: "#27ae60", 
    nombre: "Calma",
    descripcion: "Bajo contagio, alta efectividad del diálogo. El conflicto se controla."
  },
  moderado: { 
    a: a_base * 1.2,      // Aumenta contagio
    b: b_base * 0.8,      // Disminuye recuperación
    c: c_base * 0.7,      // Menor efectividad del diálogo
    k: k_base * 0.8,      // Menor reacción institucional
    r: r_base * 1.2,      // Mayor desgaste
    color: "#e67e22", 
    nombre: "Tensión",
    descripcion: "Contagio medio, diálogo limitado. El descontento crece."
  },
  critico: { 
    a: a_base * 2,        // Mucho contagio
    b: b_base * 0.5,      // Muy poca recuperación
    c: c_base * 0.3,      // Diálogo inefectivo
    k: k_base * 0.4,      // Poca reacción institucional
    r: r_base * 1.8,      // Rápido desgaste
    color: "#e74c3c", 
    nombre: "Crisis",
    descripcion: "Alto contagio, diálogo inefectivo. ¡Explosión de protestas!"
  }
};

// ==================== FUNCIÓN PARA ACTUALIZAR PANEL DE VALORES ====================
function actualizarPanelValores() {
  const valores = valoresCasos[casoActual];
  
  document.getElementById("aActual").innerHTML = valores.a.toFixed(4);
  document.getElementById("aActual").style.color = valores.color;
  document.getElementById("bActual").innerHTML = valores.b.toFixed(2);
  document.getElementById("cActual").innerHTML = valores.c.toFixed(4);
  document.getElementById("cActual").style.color = valores.color;
  document.getElementById("kActual").innerHTML = valores.k.toFixed(2);
  document.getElementById("rActual").innerHTML = valores.r.toFixed(2);
  
  const panel = document.getElementById("panelValoresActuales");
  if (casoActual === "ideal") {
    panel.style.borderLeftColor = "#27ae60";
    panel.style.background = "linear-gradient(135deg, #27ae6010, #e8e0f8)";
  } else if (casoActual === "moderado") {
    panel.style.borderLeftColor = "#e67e22";
    panel.style.background = "linear-gradient(135deg, #e67e2210, #e8e0f8)";
  } else {
    panel.style.borderLeftColor = "#e74c3c";
    panel.style.background = "linear-gradient(135deg, #e74c3c10, #e8e0f8)";
  }
}

// ==================== FUNCIÓN PARA SELECCIONAR CASO ====================
function seleccionarCaso(caso) {
  casoActual = caso;
  const valores = valoresCasos[caso];
  
  // Actualizar estilos de las tarjetas
  document.getElementById("cardIdeal").style.border = "2px solid transparent";
  document.getElementById("cardModerado").style.border = "2px solid transparent";
  document.getElementById("cardCritico").style.border = "2px solid transparent";
  document.getElementById(`card${caso.charAt(0).toUpperCase() + caso.slice(1)}`).style.border = `2px solid ${valores.color}`;
  
  // Actualizar panel
  actualizarPanelValores();
  
  // Ejecutar simulación con el método actual
  ejecutarSimulacion();
}

// ==================== FUNCIÓN PRINCIPAL DE SIMULACIÓN ====================
function ejecutarSimulacion() {
  // Obtener valores de los inputs
  const N0 = parseFloat(document.getElementById("neutrales0").value);
  const M0 = parseFloat(document.getElementById("manifestantes0").value);
  const D0 = parseFloat(document.getElementById("mediadores0").value);
  const dias = parseFloat(document.getElementById("dias").value);
  const h = parseFloat(document.getElementById("dt").value);
  const n = Math.ceil(dias / h);
  
  // Obtener valores del caso actual
  const valores = valoresCasos[casoActual];
  
  // ==================== FUNCIÓN DEL SISTEMA DE EDOs ====================
  // Sistema de ecuaciones diferenciales:
  // dN/dt = -a·N·M + b·D
  // dM/dt = a·N·M - c·M·D
  // dD/dt = k·M - r·D
  function sistema(y) {
    let [N, M, D] = y;
    let dNdt = -valores.a * N * M + valores.b * D;
    let dMdt = valores.a * N * M - valores.c * M * D;
    let dDdt = valores.k * M - valores.r * D;
    return [dNdt, dMdt, dDdt];
  }
  
  // ==================== INICIALIZAR ARRAYS ====================
  let t = Array(n + 1).fill(0);
  let N_arr = Array(n + 1).fill(0);
  let M_arr = Array(n + 1).fill(0);
  let D_arr = Array(n + 1).fill(0);
  
  N_arr[0] = N0;
  M_arr[0] = M0;
  D_arr[0] = D0;
  
  // ==================== MÉTODO DE EULER ====================
  if (metodoActual === "euler") {
    for (let i = 0; i < n; i++) {
      t[i + 1] = t[i] + h;
      let y = [N_arr[i], M_arr[i], D_arr[i]];
      let deriv = sistema(y);
      
      N_arr[i + 1] = y[0] + h * deriv[0];
      M_arr[i + 1] = y[1] + h * deriv[1];
      D_arr[i + 1] = y[2] + h * deriv[2];
      
      // Evitar valores negativos
      if (N_arr[i + 1] < 0) N_arr[i + 1] = 0;
      if (M_arr[i + 1] < 0) M_arr[i + 1] = 0;
      if (D_arr[i + 1] < 0) D_arr[i + 1] = 0;
    }
  }
  
  // ==================== MÉTODO DE HEUN ====================
  else if (metodoActual === "heun") {
    for (let i = 0; i < n; i++) {
      t[i + 1] = t[i] + h;
      let y = [N_arr[i], M_arr[i], D_arr[i]];
      
      // Paso 1: Predictor con Euler
      let k1 = sistema(y);
      let y_pred = [y[0] + h * k1[0], y[1] + h * k1[1], y[2] + h * k1[2]];
      
      // Paso 2: Corrector con promedio
      let k2 = sistema(y_pred);
      
      N_arr[i + 1] = y[0] + (h / 2) * (k1[0] + k2[0]);
      M_arr[i + 1] = y[1] + (h / 2) * (k1[1] + k2[1]);
      D_arr[i + 1] = y[2] + (h / 2) * (k1[2] + k2[2]);
      
      // Evitar valores negativos
      if (N_arr[i + 1] < 0) N_arr[i + 1] = 0;
      if (M_arr[i + 1] < 0) M_arr[i + 1] = 0;
      if (D_arr[i + 1] < 0) D_arr[i + 1] = 0;
    }
  }
  
  // ==================== MÉTODO RK4 ====================
  else { // rk4
    for (let i = 0; i < n; i++) {
      t[i + 1] = t[i] + h;
      let y = [N_arr[i], M_arr[i], D_arr[i]];
      
      // Calcular k1
      let k1 = sistema(y);
      
      // Calcular k2
      let y_k2 = [y[0] + (h/2) * k1[0], y[1] + (h/2) * k1[1], y[2] + (h/2) * k1[2]];
      let k2 = sistema(y_k2);
      
      // Calcular k3
      let y_k3 = [y[0] + (h/2) * k2[0], y[1] + (h/2) * k2[1], y[2] + (h/2) * k2[2]];
      let k3 = sistema(y_k3);
      
      // Calcular k4
      let y_k4 = [y[0] + h * k3[0], y[1] + h * k3[1], y[2] + h * k3[2]];
      let k4 = sistema(y_k4);
      
      // Actualizar valores con el promedio ponderado
      N_arr[i + 1] = y[0] + (h/6) * (k1[0] + 2*k2[0] + 2*k3[0] + k4[0]);
      M_arr[i + 1] = y[1] + (h/6) * (k1[1] + 2*k2[1] + 2*k3[1] + k4[1]);
      D_arr[i + 1] = y[2] + (h/6) * (k1[2] + 2*k2[2] + 2*k3[2] + k4[2]);
      
      // Evitar valores negativos
      if (N_arr[i + 1] < 0) N_arr[i + 1] = 0;
      if (M_arr[i + 1] < 0) M_arr[i + 1] = 0;
      if (D_arr[i + 1] < 0) D_arr[i + 1] = 0;
    }
  }
  
  // ==================== CÁLCULO DE ESTADÍSTICAS ====================
  let maxM = Math.max(...M_arr);
  let diaMax = t[M_arr.indexOf(maxM)];
  
  // Determinar estado del conflicto
  let estado = "";
  let estadoColor = "";
  if (M_arr[n] < 10) {
    estado = "✅ ESTABLE";
    estadoColor = "#27ae60";
  } else if (M_arr[n] < 50) {
    estado = "⚠️ CONTROLADO";
    estadoColor = "#e67e22";
  } else {
    estado = "🔴 CRÍTICO";
    estadoColor = "#e74c3c";
  }
  
  // Nombre del método para mostrar
  let metodoNombre = "";
  if (metodoActual === "euler") metodoNombre = "Euler";
  else if (metodoActual === "heun") metodoNombre = "Heun";
  else metodoNombre = "RK4 (Recomendado)";
  
  let metodoError = "";
  if (metodoActual === "euler") metodoError = "O(h)";
  else if (metodoActual === "heun") metodoError = "O(h²)";
  else metodoError = "O(h⁴) ⭐";
  
  // ==================== MOSTRAR RESULTADOS ====================
  let resultadoHtml = `
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1rem;">
      <div style="text-align:center; background:white; border-radius:12px; padding:0.8rem; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
        <div style="font-size:0.7rem; color:#7a7596;">👥 Neutrales finales</div>
        <div style="font-size:1.5rem; font-weight:800; color:#4a3b7c;">${N_arr[n].toFixed(0)}</div>
      </div>
      <div style="text-align:center; background:white; border-radius:12px; padding:0.8rem; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
        <div style="font-size:0.7rem; color:#7a7596;">✊ Manifestantes finales</div>
        <div style="font-size:1.5rem; font-weight:800; color:${estadoColor};">${M_arr[n].toFixed(0)}</div>
      </div>
      <div style="text-align:center; background:white; border-radius:12px; padding:0.8rem; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
        <div style="font-size:0.7rem; color:#7a7596;">🤝 Mediadores finales</div>
        <div style="font-size:1.5rem; font-weight:800; color:#27ae60;">${D_arr[n].toFixed(0)}</div>
      </div>
    </div>
    <div style="display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center; margin-bottom: 0.5rem;">
      <div class="badge-info" style="background: #3498db20; padding: 0.3rem 1rem; border-radius: 20px;">
        📊 Máximo manifestantes: <strong>${maxM.toFixed(0)}</strong> (día ${diaMax.toFixed(1)})
      </div>
      <div class="badge-info" style="background: ${estadoColor}20; padding: 0.3rem 1rem; border-radius: 20px; color: ${estadoColor};">
        ${estado}
      </div>
    </div>
    <div style="margin-top: 0.8rem; font-size: 0.8rem; color: #7a7596; text-align: center;">
      🔍 <strong>Método de ${metodoNombre}</strong> (Error ${metodoError}) aplicado al caso <strong style="color:${valores.color};">${valores.nombre}</strong>
    </div>
  `;
  
  document.getElementById(`${metodoActual}Resultado`).innerHTML = resultadoHtml;
  document.getElementById(`resultado${metodoActual.charAt(0).toUpperCase() + metodoActual.slice(1)}`).style.display = "block";
  
  // ==================== GENERAR TABLA DE EVOLUCIÓN ====================
  const paso = Math.max(1, Math.floor(n / 15));
  let tablaHtml = "";
  
  for (let i = 0; i <= n; i += paso) {
    let estadoTexto = "";
    let estadoIcono = "";
    if (M_arr[i] > 100) {
      estadoTexto = "🔴 CRISIS SOCIAL";
      estadoIcono = "🔥";
    } else if (M_arr[i] > 50) {
      estadoTexto = "⚠️ TENSIÓN SOCIAL";
      estadoIcono = "⚠️";
    } else if (M_arr[i] > 20) {
      estadoTexto = "📈 DESCONTENTO";
      estadoIcono = "📈";
    } else {
      estadoTexto = "✅ CALMA SOCIAL";
      estadoIcono = "✅";
    }
    
    tablaHtml += `<tr>
      <td style="text-align:center; font-weight:bold;">${t[i].toFixed(1)}</td>
      <td style="text-align:center;">${N_arr[i].toFixed(0)}</td>
      <td style="text-align:center; font-weight:${M_arr[i] === maxM ? 'bold' : 'normal'}; color:${M_arr[i] === maxM ? '#e74c3c' : '#3d3a4a'};">${M_arr[i].toFixed(0)}</td>
      <td style="text-align:center;">${D_arr[i].toFixed(0)}</td>
      <td style="text-align:center;"><span style="background:rgba(107,78,158,0.1); padding:0.2rem 0.5rem; border-radius:20px; font-size:0.7rem;">${estadoIcono} ${estadoTexto}</span></td>
    </tr>`;
  }
  
  // Asegurar que se muestre el último valor si no está incluido
  if (n % paso !== 0) {
    let estadoTexto = "";
    let estadoIcono = "";
    if (M_arr[n] > 100) {
      estadoTexto = "🔴 CRISIS SOCIAL";
      estadoIcono = "🔥";
    } else if (M_arr[n] > 50) {
      estadoTexto = "⚠️ TENSIÓN SOCIAL";
      estadoIcono = "⚠️";
    } else if (M_arr[n] > 20) {
      estadoTexto = "📈 DESCONTENTO";
      estadoIcono = "📈";
    } else {
      estadoTexto = "✅ CALMA SOCIAL";
      estadoIcono = "✅";
    }
    
    tablaHtml += `<tr>
      <td style="text-align:center; font-weight:bold;">${t[n].toFixed(1)}</td>
      <td style="text-align:center;">${N_arr[n].toFixed(0)}</td>
      <td style="text-align:center; font-weight:bold; color:${estadoColor};">${M_arr[n].toFixed(0)}</td>
      <td style="text-align:center;">${D_arr[n].toFixed(0)}</td>
      <td style="text-align:center;"><span style="background:rgba(107,78,158,0.1); padding:0.2rem 0.5rem; border-radius:20px; font-size:0.7rem;">${estadoIcono} ${estadoTexto}</span></td>
    </tr>`;
  }
  
  document.getElementById("cuerpoTabla").innerHTML = tablaHtml;
  
  // ==================== INTERPRETACIÓN ====================
  let interpretacionHtml = "";
  
  if (casoActual === "ideal") {
    interpretacionHtml = `
      <p><strong><i class="fas fa-chart-line" style="color: #27ae60;"></i> Interpretación - Estado de Calma (${valores.nombre})</strong></p>
      <p>📊 <strong>Resultados numéricos:</strong></p>
      <ul style="margin-left: 1.5rem;">
        <li>Neutrales iniciales: <strong>${N0}</strong> → Neutrales finales: <strong>${N_arr[n].toFixed(0)}</strong></li>
        <li>Manifestantes iniciales: <strong>${M0}</strong> → Manifestantes finales: <strong>${M_arr[n].toFixed(0)}</strong></li>
        <li>Mediadores iniciales: <strong>${D0}</strong> → Mediadores finales: <strong>${D_arr[n].toFixed(0)}</strong></li>
        <li>Máximo de manifestantes: <strong>${maxM.toFixed(0)} personas</strong> (día ${diaMax.toFixed(1)})</li>
      </ul>
      <p><strong>💡 ¿Qué significa para Bolivia?</strong></p>
      <p>En un <strong>estado de calma</strong>, el descontento social se mantiene bajo control. Los parámetros clave son:</p>
      <ul style="margin-left: 1.5rem;">
        <li>📉 Tasa de contagio baja: <strong>a = ${valores.a.toFixed(4)}</strong> (el descontento no se propaga rápido)</li>
        <li>💬 Efectividad del diálogo alta: <strong>c = ${valores.c.toFixed(4)}</strong> (los mediadores son efectivos)</li>
        <li>🏛️ Reacción institucional rápida: <strong>k = ${valores.k.toFixed(2)}</strong></li>
      </ul>
      <p>📌 <strong>Recomendación:</strong> Mantener los canales de diálogo abiertos. La situación es manejable, pero no hay que descuidarla.</p>
      <p style="margin-top: 0.5rem; font-size: 0.8rem; color: #7a7596;">🔍 Simulación realizada con el método de <strong>${metodoNombre}</strong></p>
    `;
  } else if (casoActual === "moderado") {
    interpretacionHtml = `
      <p><strong><i class="fas fa-chart-line" style="color: #e67e22;"></i> Interpretación - Tensión Social (${valores.nombre})</strong></p>
      <p>📊 <strong>Resultados numéricos:</strong></p>
      <ul style="margin-left: 1.5rem;">
        <li>Neutrales iniciales: <strong>${N0}</strong> → Neutrales finales: <strong>${N_arr[n].toFixed(0)}</strong></li>
        <li>Manifestantes iniciales: <strong>${M0}</strong> → Manifestantes finales: <strong>${M_arr[n].toFixed(0)}</strong></li>
        <li>Mediadores iniciales: <strong>${D0}</strong> → Mediadores finales: <strong>${D_arr[n].toFixed(0)}</strong></li>
        <li>Máximo de manifestantes: <strong>${maxM.toFixed(0)} personas</strong> (día ${diaMax.toFixed(1)})</li>
      </ul>
      <p><strong>💡 ¿Qué significa para Bolivia?</strong></p>
      <p>En un escenario de <strong>tensión social</strong>, el descontento crece significativamente. Los parámetros críticos son:</p>
      <ul style="margin-left: 1.5rem;">
        <li>📈 Tasa de contagio media: <strong>a = ${valores.a.toFixed(4)}</strong> (el descontento se propaga)</li>
        <li>💬 Efectividad del diálogo baja: <strong>c = ${valores.c.toFixed(4)}</strong> (los mediadores no son efectivos)</li>
        <li>⏳ Desgaste de mediadores alto: <strong>r = ${valores.r.toFixed(2)}</strong></li>
      </ul>
      <p>📌 <strong>Recomendación:</strong> ¡Se necesitan medidas urgentes! Mejorar los canales de diálogo, atender las demandas sociales y reforzar la mediación para evitar la escalada.</p>
      <p style="margin-top: 0.5rem; font-size: 0.8rem; color: #7a7596;">🔍 Simulación realizada con el método de <strong>${metodoNombre}</strong></p>
    `;
  } else {
    interpretacionHtml = `
      <p><strong><i class="fas fa-chart-line" style="color: #e74c3c;"></i> Interpretación - Crisis Social (${valores.nombre})</strong></p>
      <p>📊 <strong>Resultados numéricos:</strong></p>
      <ul style="margin-left: 1.5rem;">
        <li>Neutrales iniciales: <strong>${N0}</strong> → Neutrales finales: <strong>${N_arr[n].toFixed(0)}</strong></li>
        <li>Manifestantes iniciales: <strong>${M0}</strong> → Manifestantes finales: <strong>${M_arr[n].toFixed(0)}</strong></li>
        <li>Mediadores iniciales: <strong>${D0}</strong> → Mediadores finales: <strong>${D_arr[n].toFixed(0)}</strong></li>
        <li>Máximo de manifestantes: <strong>${maxM.toFixed(0)} personas</strong> (día ${diaMax.toFixed(1)})</li>
      </ul>
      <p><strong>💡 ¿Qué significa para Bolivia?</strong></p>
      <p>¡ESTO ES UNA <strong style="color:#e74c3c;">CRISIS SOCIAL</strong>! El descontento explota, las protestas se masifican. Los parámetros críticos son:</p>
      <ul style="margin-left: 1.5rem;">
        <li>🔥 Tasa de contagio alta: <strong>a = ${valores.a.toFixed(4)}</strong> (el descontento se propaga muy rápido)</li>
        <li>💬 Efectividad del diálogo muy baja: <strong>c = ${valores.c.toFixed(4)}</strong> (el diálogo no funciona)</li>
        <li>🏛️ Reacción institucional lenta: <strong>k = ${valores.k.toFixed(2)}</strong></li>
        <li>⏳ Desgaste de mediadores muy alto: <strong>r = ${valores.r.toFixed(2)}</strong></li>
      </ul>
      <p>📌 <strong>Recomendación:</strong> ¡ACCIONES INMEDIATAS! Diálogo nacional urgente, concesiones para calmar el descontento, mediación internacional y medidas para restablecer el orden.</p>
      <p style="margin-top: 0.5rem; font-size: 0.8rem; color: #7a7596;">🔍 Simulación realizada con el método de <strong>${metodoNombre}</strong></p>
    `;
  }
  
  document.getElementById("interpretacionFinal").innerHTML = interpretacionHtml;
  
  // ==================== ACTUALIZAR GRÁFICA ====================
  if (chart) chart.destroy();
  const ctx = document.getElementById("graficoSocial").getContext("2d");
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: t.map(v => v.toFixed(1)),
      datasets: [
        {
          label: '👥 Neutrales (N)',
          data: N_arr,
          borderColor: '#4a3b7c',
          backgroundColor: 'transparent',
          borderWidth: 2,
          tension: 0.3,
          pointRadius: 1,
          fill: false
        },
        {
          label: '✊ Manifestantes (M)',
          data: M_arr,
          borderColor: valores.color,
          backgroundColor: 'transparent',
          borderWidth: 3,
          tension: 0.3,
          pointRadius: 2,
          fill: false
        },
        {
          label: '🤝 Mediadores (D)',
          data: D_arr,
          borderColor: '#27ae60',
          backgroundColor: 'transparent',
          borderWidth: 2,
          tension: 0.3,
          pointRadius: 1,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { 
          labels: { 
            color: '#4a3b7c',
            font: { size: 11 }
          } 
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              return `${label}: ${context.raw.toFixed(0)} personas`;
            }
          }
        }
      },
      scales: {
        y: { 
          beginAtZero: true, 
          title: { display: true, text: 'Número de personas', color: '#7a7596' },
          grid: { color: 'rgba(107,78,158,0.1)' }
        },
        x: { 
          title: { display: true, text: 'Días', color: '#7a7596' },
          grid: { color: 'rgba(107,78,158,0.1)' }
        }
      }
    }
  });
}

// ==================== EVENTOS ====================
document.addEventListener("DOMContentLoaded", () => {
  // Botones de métodos
  document.getElementById("btnEuler").addEventListener("click", () => {
    metodoActual = "euler";
    ejecutarSimulacion();
  });
  document.getElementById("btnHeun").addEventListener("click", () => {
    metodoActual = "heun";
    ejecutarSimulacion();
  });
  document.getElementById("btnRK4").addEventListener("click", () => {
    metodoActual = "rk4";
    ejecutarSimulacion();
  });
  
  // Inputs que cambian la simulación
  document.getElementById("neutrales0").addEventListener("change", ejecutarSimulacion);
  document.getElementById("manifestantes0").addEventListener("change", ejecutarSimulacion);
  document.getElementById("mediadores0").addEventListener("change", ejecutarSimulacion);
  document.getElementById("dias").addEventListener("change", ejecutarSimulacion);
  document.getElementById("dt").addEventListener("change", ejecutarSimulacion);
  
  // Inicializar
  seleccionarCaso("ideal");
});