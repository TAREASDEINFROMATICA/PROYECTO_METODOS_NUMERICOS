// ==================== DATOS DE ESCENARIOS ====================
const escenarios = {
  ideal: {
    nombre: "📈 Estado ideal",
    descripcion: "Inflación controlada, precios suben gradualmente.",
    incremento: "+87%",
    dias: [1, 5, 10, 15, 20, 30],
    precios: [7.8, 8.1, 8.9, 10.2, 11.8, 14.6],
    color: "#6b4e9e"
  },
  moderado: {
    nombre: "⚠️ Crisis moderada",
    descripcion: "Desabastecimiento parcial, precios se disparan.",
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

// ==================== INTERPOLACIÓN LINEAL ====================
function interpolarPrecios(dias, precios) {
  let resultado = [];
  for (let i = 1; i <= 30; i++) {
    let encontrado = false;
    for (let j = 0; j < dias.length - 1; j++) {
      if (i >= dias[j] && i <= dias[j + 1]) {
        let t = (i - dias[j]) / (dias[j + 1] - dias[j]);
        let precio = precios[j] + t * (precios[j + 1] - precios[j]);
        resultado.push(parseFloat(precio.toFixed(2)));
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

// ==================== MÉTODO DEL TRAPECIO ====================
function calcularTrapecio(precios) {
  let h = 1;
  let suma = precios[0] + precios[precios.length - 1];
  let terminos = [];
  let sumaDetalle = [];
  
  // Primer término
  sumaDetalle.push({ dia: 1, precio: precios[0], factor: 1, aporte: precios[0] });
  
  for (let i = 1; i < precios.length - 1; i++) {
    let aporte = 2 * precios[i];
    suma += aporte;
    terminos.push({
      dia: i + 1,
      precio: precios[i],
      aporte: aporte,
      acumulado: suma
    });
    sumaDetalle.push({ dia: i + 1, precio: precios[i], factor: 2, aporte: aporte });
  }
  
  // Último término
  sumaDetalle.push({ dia: 30, precio: precios[29], factor: 1, aporte: precios[29] });
  
  let resultado = (h / 2) * suma;
  let sinInflacion = escenarios[escenarioActual].precios[0] * 30;
  let perdida = resultado - sinInflacion;
  let porcentajePerdida = (perdida / sinInflacion) * 100;
  
  return { resultado, suma, terminos, sumaDetalle, sinInflacion, perdida, porcentajePerdida };
}

// ==================== FUNCIÓN PARA OBTENER CÁLCULO DEL PRECIO ====================
function obtenerCalculoPrecio(dia, data) {
  for (let j = 0; j < data.dias.length - 1; j++) {
    if (dia >= data.dias[j] && dia <= data.dias[j + 1]) {
      if (dia === data.dias[j] || dia === data.dias[j + 1]) {
        return `📌 Dato conocido (día ${dia})`;
      } else {
        let t = (dia - data.dias[j]) / (data.dias[j + 1] - data.dias[j]);
        return `📐 Interpolación: ${data.precios[j]} → ${data.precios[j + 1]} (t=${t.toFixed(2)})`;
      }
    }
  }
  return "—";
}

// ==================== ACTUALIZAR TODO ====================
function actualizarTodo() {
  const data = escenarios[escenarioActual];
  
  // Generar precios diarios
  preciosDiarios = interpolarPrecios(data.dias, data.precios);
  
  // Calcular con Trapecio
  const { resultado, suma, terminos, sumaDetalle, sinInflacion, perdida, porcentajePerdida } = calcularTrapecio(preciosDiarios);
  
  // 1. Actualizar información del escenario
  document.getElementById("escenarioInfo").innerHTML = `
    <strong><i class="fas fa-chart-line"></i> ${data.nombre}</strong><br>
    ${data.descripcion}<br>
    📅 Precio día 1: <strong>${data.precios[0]} Bs/kg</strong> | 
    📅 Precio día 30: <strong>${data.precios[data.precios.length-1]} Bs/kg</strong> | 
    📊 Incremento total: <strong>${data.incremento}</strong>
  `;
  
  // 2. Actualizar tabla de datos conocidos
  const tbodyDatos = document.getElementById("cuerpoDatos");
  tbodyDatos.innerHTML = "";
  for (let i = 0; i < data.dias.length; i++) {
    let icono = i === 0 ? "🏁" : (i === data.dias.length-1 ? "🎯" : "📌");
    let nota = i === 0 ? "Precio inicial" : (i === data.dias.length-1 ? "Precio final" : `Día de registro`);
    tbodyDatos.innerHTML += `<tr>
      <td><strong>${icono} ${data.dias[i]}</strong></td>
      <td><strong>${data.precios[i]} Bs</strong></td>
      <td><span class="badge-metodo">${nota}</span></td>
    </tr>`;
  }
  
  // 3. Tabla completa de precios diarios
  const tbodyCompleto = document.getElementById("cuerpoPreciosCompletos");
  tbodyCompleto.innerHTML = "";
  for (let i = 0; i < preciosDiarios.length; i++) {
    let dia = i + 1;
    let calculo = obtenerCalculoPrecio(dia, data);
    let factor = (dia === 1 || dia === 30) ? 1 : 2;
    let aporte = preciosDiarios[i] * factor;
    
    let rowClass = (dia === 1 || dia === 30) ? "" : "style='background: rgba(107,78,158,0.02)'";
    tbodyCompleto.innerHTML += `<tr ${rowClass}>
      <td><strong>${dia}</strong></td>
      <td>${preciosDiarios[i].toFixed(2)} Bs</td>
      <td><small>${calculo}</small></td>
      <td><strong>${factor}</strong></td>
      <td>${aporte.toFixed(2)} Bs</td>
    </tr>`;
  }
  
  // 4. Resumen de cálculos
  document.getElementById("resumenCalculos").innerHTML = `
    <div class="card-comparacion">
      <div class="numero">${preciosDiarios[0].toFixed(2)} Bs</div>
      <div class="etiqueta">Precio día 1</div>
    </div>
    <div class="card-comparacion">
      <div class="numero">${preciosDiarios[29].toFixed(2)} Bs</div>
      <div class="etiqueta">Precio día 30</div>
    </div>
    <div class="card-comparacion">
      <div class="numero">${suma.toFixed(2)}</div>
      <div class="etiqueta">Suma [f₁ + 2f₂ + ... + f₃₀]</div>
    </div>
    <div class="card-comparacion">
      <div class="numero">× 0.5</div>
      <div class="etiqueta">Multiplicador (h/2)</div>
    </div>
  `;
  
  // 5. Desarrollo detallado de la suma
  let desarrolloHtml = `<strong>📐 Aplicando la fórmula:</strong><br>`;
  desarrolloHtml += `Trapecio = (1/2) × [f₁ + 2f₂ + 2f₃ + ... + 2f₂₉ + f₃₀]<br><br>`;
  desarrolloHtml += `<strong>🔢 Desglose de la suma:</strong><br>`;
  desarrolloHtml += `f₁ = ${preciosDiarios[0].toFixed(2)}<br>`;
  
  // Mostrar algunos términos intermedios
  let mostrados = 0;
  for (let item of sumaDetalle) {
    if (item.dia !== 1 && item.dia !== 30) {
      if (mostrados < 8 || item.dia > 25) {
        desarrolloHtml += `+ ${item.factor}×f${item.dia} = ${item.aporte.toFixed(2)}<br>`;
        mostrados++;
      } else if (mostrados === 8) {
        desarrolloHtml += `<span style="color: #8b6cc9;">... (días ${item.dia - 1} al ${30 - item.dia}) ...</span><br>`;
        mostrados++;
      }
    }
  }
  
  desarrolloHtml += `<strong style="color: #6b4e9e;">Suma total = ${suma.toFixed(2)}</strong><br><br>`;
  desarrolloHtml += `<strong>✨ Multiplicamos por h/2 = 0.5:</strong><br>`;
  desarrolloHtml += `Trapecio = 0.5 × ${suma.toFixed(2)} = <strong style="font-size: 1.2rem; color: #6b4e9e;">${resultado.toFixed(2)} Bs</strong>`;
  
  document.getElementById("desarrolloSuma").innerHTML = desarrolloHtml;
  
  // 6. Resultado final destacado
  document.getElementById("resultadoFinal").innerHTML = `
    <div class="valor">${resultado.toFixed(2)} Bs</div>
    <div style="font-size: 0.9rem;">Gasto total estimado en papa durante el mes</div>
    <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.2);">
      <div style="display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap;">
        <div><small>💰 Sin inflación:</small><br><strong>${sinInflacion.toFixed(2)} Bs</strong></div>
        <div><small>📉 Pérdida:</small><br><strong>${perdida.toFixed(2)} Bs</strong></div>
        <div><small>⚠️ % pérdida:</small><br><strong>${porcentajePerdida.toFixed(1)}%</strong></div>
      </div>
    </div>
  `;
  
  // 7. Interpretación económica
  let interpretacion = "";
  if (escenarioActual === "ideal") {
    interpretacion = `
      <p><i class="fas fa-chart-line"></i> <strong>Estado ideal (+87% de inflación)</strong></p>
      <p>Una familia gasta aproximadamente <strong>${resultado.toFixed(2)} Bs</strong> en papa durante el mes.</p>
      <p>💰 <strong>Comparativa:</strong> Si los precios no hubieran subido, gastarían solo <strong>${sinInflacion.toFixed(2)} Bs</strong>.</p>
      <p>📉 <strong>Pérdida del poder adquisitivo:</strong> ${perdida.toFixed(2)} Bs (${porcentajePerdida.toFixed(0)}% más).</p>
      <p>💡 <strong>Impacto real:</strong> Esta pérdida equivale a aproximadamente <strong>4 almuerzos familiares</strong> o <strong>2 días de transporte público</strong>.</p>
    `;
  } else if (escenarioActual === "moderado") {
    interpretacion = `
      <p><i class="fas fa-exclamation-triangle"></i> <strong>Crisis moderada (+300% de inflación)</strong></p>
      <p>Una familia gasta aproximadamente <strong>${resultado.toFixed(2)} Bs</strong> en papa durante el mes.</p>
      <p>💰 <strong>Comparativa:</strong> Sin inflación, gastarían solo <strong>${sinInflacion.toFixed(2)} Bs</strong>.</p>
      <p>📉 <strong>Pérdida del poder adquisitivo:</strong> ${perdida.toFixed(2)} Bs (${porcentajePerdida.toFixed(0)}% más).</p>
      <p>💡 <strong>Impacto real:</strong> Con un salario mínimo de 2,500 Bs, la pérdida del ${porcentajePerdida.toFixed(0)}% significa que la familia necesita ganar <strong>2.5 veces más</strong> solo para mantener el consumo de papa.</p>
    `;
  } else {
    interpretacion = `
      <p><i class="fas fa-fire"></i> <strong>Crisis crítica (+680% de inflación)</strong></p>
      <p>Una familia gasta aproximadamente <strong>${resultado.toFixed(2)} Bs</strong> en papa durante el mes.</p>
      <p>💰 <strong>Comparativa:</strong> Sin inflación, gastarían solo <strong>${sinInflacion.toFixed(2)} Bs</strong>.</p>
      <p>📉 <strong>Pérdida del poder adquisitivo:</strong> ${perdida.toFixed(2)} Bs (${porcentajePerdida.toFixed(0)}% más).</p>
      <p>💡 <strong>Impacto real:</strong> Con salario mínimo de 2,500 Bs, la familia destinaría más del <strong>60% de su ingreso</strong> solo a comprar papa. ¡Muchas familias ya no pueden acceder a este alimento básico!</p>
    `;
  }
  document.getElementById("interpretacionEconomica").innerHTML = interpretacion;
  
  // 8. Gráfica
  actualizarGrafica(data.color, resultado);
}

// ==================== GRÁFICA ====================
function actualizarGrafica(color, gasto) {
  const ctx = document.getElementById("grafico").getContext("2d");
  const dias = Array.from({ length: 30 }, (_, i) => i + 1);
  
  if (chartInstance) chartInstance.destroy();
  
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dias,
      datasets: [
        {
          label: 'Precio diario (Bs/kg)',
          data: preciosDiarios,
          borderColor: color,
          backgroundColor: 'transparent',
          borderWidth: 3,
          tension: 0.3,
          fill: false,
          pointRadius: 3,
          pointBackgroundColor: color,
          pointBorderColor: 'white'
        },
        {
          label: `Área bajo la curva = ${gasto.toFixed(2)} Bs`,
          data: preciosDiarios,
          borderColor: 'transparent',
          backgroundColor: `rgba(107, 78, 158, 0.25)`,
          fill: true,
          pointRadius: 0
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
            font: { weight: '500' }
          } 
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `Precio: ${context.raw.toFixed(2)} Bs/kg`;
            }
          }
        }
      },
      scales: {
        y: { 
          title: { display: true, text: 'Precio (Bs/kg)', color: '#7a7596' }, 
          grid: { color: 'rgba(107, 78, 158, 0.08)' }, 
          beginAtZero: true,
          ticks: { color: '#5a5580' }
        },
        x: { 
          title: { display: true, text: 'Día del mes', color: '#7a7596' }, 
          grid: { color: 'rgba(107, 78, 158, 0.08)' },
          ticks: { color: '#5a5580' }
        }
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