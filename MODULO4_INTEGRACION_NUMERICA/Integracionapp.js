// ==================== DATOS DE ESCENARIOS ====================
const escenarios = {
  ideal: {
    nombre: "📈 Estado ideal",
    descripcion: "Inflación controlada, precios suben gradualmente.",
    incremento: "+87%",
    dias: [1, 5, 10, 15, 20, 30],
    precios: [7.8, 8.1, 8.9, 10.2, 11.8, 14.6],
    color: "#2d6a4f"
  },
  moderado: {
    nombre: "⚠️ Crisis moderada",
    descripcion: "Desabastecimiento parcial, precios se duplican.",
    incremento: "+300%",
    dias: [1, 5, 10, 15, 20, 30],
    precios: [8.5, 9.4, 11.8, 16.2, 22.5, 34.0],
    color: "#e67e22"
  },
  critico: {
    nombre: "🔥 Crisis crítica",
    descripcion: "Escasez severa, especulación descontrolada.",
    incremento: "+680%",
    dias: [1, 5, 10, 15, 20, 30],
    precios: [10.0, 13.0, 19.0, 29.0, 44.0, 78.0],
    color: "#e74c3c"
  }
};

let escenarioActual = "ideal";
let preciosDiarios = [];
let chartInstance = null;

// ==================== INTERPOLACIÓN INTERNA (solo para generar datos) ====================
// Nota: Esto es interno del módulo. El usuario NO ve esto. Solo usamos los resultados.
function interpolarPrecios(dias, precios) {
  let resultado = [];
  for (let i = 1; i <= 30; i++) {
    let encontrado = false;
    for (let j = 0; j < dias.length - 1; j++) {
      if (i >= dias[j] && i <= dias[j + 1]) {
        let t = (i - dias[j]) / (dias[j + 1] - dias[j]);
        let precio = precios[j] + t * (precios[j + 1] - precios[j]);
        resultado.push(precio);
        encontrado = true;
        break;
      }
    }
    if (!encontrado && i === dias[dias.length - 1]) {
      resultado.push(precios[precios.length - 1]);
    } else if (!encontrado && i === dias[0]) {
      resultado.push(precios[0]);
    }
  }
  return resultado;
}

// ==================== MÉTODOS DE INTEGRACIÓN ====================
function metodoTrapecio(precios) {
  let suma = precios[0] + precios[29];
  for (let i = 1; i < 29; i++) {
    suma += 2 * precios[i];
  }
  return suma / 2;
}

function metodoSimpson13(precios) {
  let suma = precios[0] + precios[29];
  for (let i = 1; i < 29; i++) {
    if (i % 2 === 0) {
      suma += 2 * precios[i];
    } else {
      suma += 4 * precios[i];
    }
  }
  return suma / 3;
}

function metodoSimpson38(precios) {
  let suma = precios[0] + precios[29];
  for (let i = 1; i < 29; i++) {
    if (i % 3 === 0) {
      suma += 2 * precios[i];
    } else {
      suma += 3 * precios[i];
    }
  }
  return (3 * suma) / 8;
}

// ==================== ACTUALIZAR TODO AUTOMÁTICAMENTE ====================
// ==================== ACTUALIZAR PANEL LATERAL DE DATOS ====================
function actualizarPanelLateral() {
  const data = escenarios[escenarioActual];
  const container = document.getElementById("listaPreciosEscenario");
  
  let html = '';
  for (let i = 0; i < data.dias.length; i++) {
    let icono = i === 0 ? '📅' : (i === data.dias.length-1 ? '🏁' : '📌');
    html += `
      <div class="item-precio">
        <span class="dia">${icono} Día ${data.dias[i]}</span>
        <span class="precio">${data.precios[i]} Bs/kg</span>
      </div>
    `;
  }
  
  // Agregar resumen
  html += `
    <div class="item-precio" style="background: rgba(30,60,114,0.1); margin-top: 0.5rem;">
      <span class="dia"><strong>📊 Variación</strong></span>
      <span class="precio"><strong>${data.incremento}</strong></span>
    </div>
  `;
  
  container.innerHTML = html;
}

// Modificar la función actualizarTodo existente - agregar esta línea al final:
function actualizarTodo() {
  const data = escenarios[escenarioActual];
  
  // Generar precios diarios
  preciosDiarios = interpolarPrecios(data.dias, data.precios);
  
  // Calcular resultados
  let trapecio = metodoTrapecio(preciosDiarios);
  let simpson13 = metodoSimpson13(preciosDiarios);
  let simpson38 = metodoSimpson38(preciosDiarios);
  let sinInflacion = data.precios[0] * 30;
  let perdida = simpson13 - sinInflacion;
  let porcentajePerdida = (perdida / sinInflacion) * 100;
  
  // 1. Actualizar información del escenario
  document.getElementById("escenarioInfo").innerHTML = `
    <strong>${data.nombre}</strong><br>
    ${data.descripcion}<br>
    Precio inicial: <strong>${data.precios[0]} Bs</strong> | 
    Precio final: <strong>${data.precios[data.precios.length-1]} Bs</strong> | 
    Incremento: <strong>${data.incremento}</strong>
  `;
  
  // 2. Actualizar panel lateral de datos
  actualizarPanelLateral();
  
  // 3. Actualizar tabla de datos conocidos
  const tbody = document.getElementById("cuerpoTablaDatos");
  tbody.innerHTML = "";
  for (let i = 0; i < data.dias.length; i++) {
    let nota = i === 0 ? "📅 Precio inicial" : (i === data.dias.length-1 ? "🏁 Precio final" : `📌 Día ${data.dias[i]}`);
    tbody.innerHTML += `<tr><td><strong>${data.dias[i]}</strong></td><td>${data.precios[i]} Bs</td><td>${nota}</td></tr>`;
  }
  
  // 4. Actualizar resultados automáticos
  document.getElementById("resultadosAutomaticos").innerHTML = `
    <div class="resultado-card">
      <h3>📐 Trapecio</h3>
      <div class="valor">${trapecio.toFixed(2)} Bs</div>
      <small>Error O(h²) = 1/12</small>
    </div>
    <div class="resultado-card recomendado">
      <h3>📈 Simpson 1/3 ⭐</h3>
      <div class="valor">${simpson13.toFixed(2)} Bs</div>
      <small>Error O(h⁴) = 1/90 (más preciso)</small>
    </div>
    <div class="resultado-card">
      <h3>📊 Simpson 3/8</h3>
      <div class="valor">${simpson38.toFixed(2)} Bs</div>
      <small>Error O(h⁴) = 1/90</small>
    </div>
  `;
  
  // 5. Actualizar tabla de comparación de métodos
  document.getElementById("cuerpoComparacion").innerHTML = `
    <tr><td><strong>Trapecio</strong></td><td><code>(h/2)[f₀+2f₁+...+2f₂₉+f₃₀]</code></td><td>O(h²)</td><td>${trapecio.toFixed(2)} Bs</td><td>${((Math.abs(trapecio-simpson13)/simpson13)*100).toFixed(2)}% error relativo</td></tr>
    <tr style="background:rgba(30,60,114,0.05)"><td><strong>Simpson 1/3</strong></td><td><code>(h/3)[f₀+4f₁+2f₂+...+4f₂₉+f₃₀]</code></td><td>O(h⁴)</td><td><strong>${simpson13.toFixed(2)} Bs</strong></td><td>⭐ Referencia (más preciso)</td></tr>
    <tr><td><strong>Simpson 3/8</strong></td><td><code>(3h/8)[f₀+3f₁+3f₂+2f₃+...+f₃₀]</code></td><td>O(h⁴)</td><td>${simpson38.toFixed(2)} Bs</td><td>${((Math.abs(simpson38-simpson13)/simpson13)*100).toFixed(2)}% error relativo</td></tr>
  `;
  
  document.getElementById("recomendacionMetodo").innerHTML = `
    ✅ <strong>Recomendación:</strong> Simpson 1/3 es el método más preciso porque tiene error O(h⁴) = 1/90 ≈ 0.0111, 
    mientras que el Trapecio tiene error O(h²) = 1/12 ≈ 0.0833. Para el cálculo del gasto familiar, 
    se recomienda usar <strong>Simpson 1/3</strong>.
  `;
  
  // 6. Actualizar tabla de comparación de escenarios
  let escenariosHtml = "";
  for (let [id, esc] of Object.entries(escenarios)) {
    let pTemp = interpolarPrecios(esc.dias, esc.precios);
    let g = metodoSimpson13(pTemp);
    let sin = esc.precios[0] * 30;
    let per = g - sin;
    let porc = (per / sin) * 100;
    let impacto = id === "ideal" ? "⚠️ Moderado" : (id === "moderado" ? "🔴 Grave" : "💀 Catastrófico");
    let nombre = id === "ideal" ? "📈 Ideal" : (id === "moderado" ? "⚠️ Moderada" : "🔥 Crítica");
    escenariosHtml += `<tr>
      <td><strong>${nombre}</strong></td><td>${esc.precios[0]} Bs</td><td>${esc.precios[esc.precios.length-1]} Bs</td>
      <td>${g.toFixed(2)} Bs</td><td>${sin.toFixed(2)} Bs</td><td><strong>${per.toFixed(2)} Bs</strong></td>
      <td><strong>${porc.toFixed(0)}%</strong></td><td>${impacto}</td>
    </tr>`;
  }
  document.getElementById("cuerpoEscenarios").innerHTML = escenariosHtml;
  
  // 7. Actualizar interpretación
  let interpretacion = "";
  if (escenarioActual === "ideal") {
    interpretacion = `
      <p><strong>📊 Análisis del Estado ideal:</strong></p>
      <p>Una familia gasta aproximadamente <strong>${simpson13.toFixed(2)} Bs</strong> en papa durante el mes. 
      Si los precios no hubieran subido, gastaría solo <strong>${sinInflacion.toFixed(2)} Bs</strong>.</p>
      <p>La pérdida es de <strong>${perdida.toFixed(2)} Bs (${porcentajePerdida.toFixed(0)}%)</strong>.</p>
      <p>💡 <strong>Interpretación:</strong> Esta pérdida equivale a aproximadamente <strong>4 almuerzos familiares</strong> 
      o <strong>2 días de transporte público</strong>. Aunque es notable, la situación es manejable.</p>
    `;
  } else if (escenarioActual === "moderado") {
    interpretacion = `
      <p><strong>📊 Análisis de la Crisis moderada:</strong></p>
      <p>Una familia gasta aproximadamente <strong>${simpson13.toFixed(2)} Bs</strong> en papa durante el mes. 
      Si los precios no hubieran subido, gastaría solo <strong>${sinInflacion.toFixed(2)} Bs</strong>.</p>
      <p>La pérdida es de <strong>${perdida.toFixed(2)} Bs (${porcentajePerdida.toFixed(0)}%)</strong>.</p>
      <p>💡 <strong>Interpretación:</strong> Con un salario mínimo de 2,500 Bs, la pérdida del ${porcentajePerdida.toFixed(0)}% 
      significa que la familia necesita ganar <strong>2.5 veces más</strong> solo para mantener el consumo de papa.</p>
    `;
  } else {
    interpretacion = `
      <p><strong>📊 Análisis de la Crisis crítica:</strong></p>
      <p>Una familia gasta aproximadamente <strong>${simpson13.toFixed(2)} Bs</strong> en papa durante el mes. 
      Si los precios no hubieran subido, gastaría solo <strong>${sinInflacion.toFixed(2)} Bs</strong>.</p>
      <p>La pérdida es de <strong>${perdida.toFixed(2)} Bs (${porcentajePerdida.toFixed(0)}%)</strong>.</p>
      <p>💡 <strong>Interpretación:</strong> Con salario mínimo de 2,500 Bs, la pérdida del ${porcentajePerdida.toFixed(0)}% 
      significa que una familia destinaría más del <strong>60% de su ingreso</strong> solo a comprar papa. 
      ¡Muchas familias ya no pueden acceder a este alimento básico!</p>
    `;
  }
  document.getElementById("interpretacionFinal").innerHTML = interpretacion;
  
  // 8. Actualizar gráfica
  actualizarGrafica(data.color, simpson13);
}

// Asegurar que el panel lateral se cargue al inicio
document.addEventListener("DOMContentLoaded", () => {
  actualizarTodo();
  actualizarPanelLateral();
  
  document.querySelectorAll(".case-button").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".case-button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      escenarioActual = btn.dataset.case;
      actualizarTodo();
    });
  });
});

// ==================== GRÁFICA ====================
function actualizarGrafica(color, gasto) {
  const ctx = document.getElementById("precioGraph").getContext("2d");
  const dias = Array.from({ length: 30 }, (_, i) => i + 1);
  
  if (chartInstance) chartInstance.destroy();
  
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dias,
      datasets: [
        {
          label: 'Precio diario (Bs)',
          data: preciosDiarios,
          borderColor: color,
          backgroundColor: 'rgba(167, 139, 250, 0.05)',
          borderWidth: 3,
          tension: 0.3,
          fill: false,
          pointRadius: 2
        },
        {
          label: `Gasto total = ${gasto.toFixed(2)} Bs`,
          data: preciosDiarios,
          borderColor: 'transparent',
          backgroundColor: 'rgba(167, 139, 250, 0.3)',
          fill: true,
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { labels: { color: '#e0e0e0' } }
      },
      scales: {
        y: { title: { display: true, text: 'Precio (Bs)', color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true },
        x: { title: { display: true, text: 'Día del mes', color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
      }
    }
  });
}

// ==================== EVENTOS ====================
document.addEventListener("DOMContentLoaded", () => {
  actualizarTodo();
  
  document.querySelectorAll(".case-button").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".case-button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      escenarioActual = btn.dataset.case;
      actualizarTodo();
    });
  });
});