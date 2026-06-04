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

// ==================== FUNCIÓN PARA OBTENER CÁLCULO DEL PRECIO ====================
function obtenerCalculoPrecio(dia, data) {
  for (let j = 0; j < data.dias.length - 1; j++) {
    if (dia >= data.dias[j] && dia <= data.dias[j + 1]) {
      if (dia === data.dias[j] || dia === data.dias[j + 1]) {
        return `📌 Dato conocido (día ${dia})`;
      } else {
        let t = (dia - data.dias[j]) / (data.dias[j + 1] - data.dias[j]);
        return `📐 Interpolación: ${data.precios[j]} → ${data.precios[j + 1]}`;
      }
    }
  }
  return "—";
}

// ==================== MÉTODO DE SIMPSON 1/3 ====================
function calcularSimpson13(precios) {
  let h = 1;
  let suma = precios[0] + precios[precios.length - 1];
  let terminos = [];
  let sumaImpares = 0;
  let sumaPares = 0;
  let detalles = [];
  
  // Primer término
  detalles.push({ dia: 1, precio: precios[0], coeficiente: 1, aporte: precios[0], tipo: "primero" });
  
  for (let i = 1; i < precios.length - 1; i++) {
    let coeficiente = (i % 2 === 0) ? 2 : 4;
    let aporte = coeficiente * precios[i];
    suma += aporte;
    let tipo = (i % 2 === 0) ? "par (×2)" : "impar (×4)";
    terminos.push({
      dia: i + 1,
      precio: precios[i],
      coeficiente: coeficiente,
      aporte: aporte,
      tipo: tipo,
      acumulado: suma
    });
    detalles.push({ dia: i + 1, precio: precios[i], coeficiente: coeficiente, aporte: aporte, tipo: tipo });
    
    if (i % 2 === 0) {
      sumaPares += aporte;
    } else {
      sumaImpares += aporte;
    }
  }
  
  // Último término
  detalles.push({ dia: 30, precio: precios[29], coeficiente: 1, aporte: precios[29], tipo: "último" });
  
  let resultado = (h / 3) * suma;
  let sinInflacion = escenarios[escenarioActual].precios[0] * 30;
  let perdida = resultado - sinInflacion;
  let porcentajePerdida = (perdida / sinInflacion) * 100;
  
  return { resultado, suma, terminos, sumaImpares, sumaPares, detalles, sinInflacion, perdida, porcentajePerdida };
}

// ==================== MÉTODO DEL TRAPECIO ====================
function calcularTrapecio(precios) {
  let suma = precios[0] + precios[29];
  for (let i = 1; i < 29; i++) {
    suma += 2 * precios[i];
  }
  return suma / 2;
}

// ==================== ACTUALIZAR TODO ====================
function actualizarTodo() {
  const data = escenarios[escenarioActual];
  
  // Generar precios diarios
  preciosDiarios = interpolarPrecios(data.dias, data.precios);
  
  // Calcular con Simpson 1/3
  const { resultado, suma, detalles, sumaImpares, sumaPares, sinInflacion, perdida, porcentajePerdida } = calcularSimpson13(preciosDiarios);
  
  // Calcular Trapecio para comparar
  const trapecio = calcularTrapecio(preciosDiarios);
  const diferencia = Math.abs(resultado - trapecio);
  const mejora = ((trapecio - resultado) / resultado) * 100;
  const factorPrecision = (1/12) / (1/90); // 7.5 veces más preciso
  
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
      <td><span class="badge-metodo" style="background: rgba(107,78,158,0.15); padding: 0.2rem 0.6rem; border-radius: 20px;">${nota}</span></td>
    </tr>`;
  }
  
  // 3. Tabla completa de precios diarios con coeficientes
  const tbodyCompleto = document.getElementById("cuerpoPreciosCompletos");
  tbodyCompleto.innerHTML = "";
  for (let i = 0; i < preciosDiarios.length; i++) {
    let dia = i + 1;
    let calculo = obtenerCalculoPrecio(dia, data);
    let detalle = detalles.find(d => d.dia === dia);
    let coeficiente = detalle ? detalle.coeficiente : (dia === 1 || dia === 30 ? 1 : (i % 2 === 0 ? 2 : 4));
    let aporte = preciosDiarios[i] * coeficiente;
    let tipo = dia === 1 ? "Primero" : (dia === 30 ? "Último" : (i % 2 === 0 ? "Posición PAR (×2)" : "Posición IMPAR (×4)"));
    let claseCoef = coeficiente === 1 ? "coef-1" : (coeficiente === 2 ? "coef-2" : "coef-4");
    
    tbodyCompleto.innerHTML += `<tr>
      <td><strong>${dia}</strong></td>
      <td>${preciosDiarios[i].toFixed(2)} Bs</td>
      <td><small>${calculo}</small></td>
      <td><span class="badge-coef ${claseCoef}">×${coeficiente}</span></td>
      <td><strong>${aporte.toFixed(2)} Bs</strong></td>
      <td><small>${tipo}</small></td>
     </tr>`;
  }
  
  // 4. Resumen de cálculos
  document.getElementById("resumenCalculos").innerHTML = `
    <div class="card-comparacion">
      <div class="numero">${preciosDiarios[0].toFixed(2)} Bs</div>
      <div class="etiqueta">Precio día 1 (f₁)</div>
    </div>
    <div class="card-comparacion">
      <div class="numero">${preciosDiarios[29].toFixed(2)} Bs</div>
      <div class="etiqueta">Precio día 30 (f₃₀)</div>
    </div>
    <div class="card-comparacion">
      <div class="numero">${sumaImpares.toFixed(2)}</div>
      <div class="etiqueta">Suma (impares ×4)</div>
    </div>
    <div class="card-comparacion">
      <div class="numero">${sumaPares.toFixed(2)}</div>
      <div class="etiqueta">Suma (pares ×2)</div>
    </div>
    <div class="card-comparacion">
      <div class="numero">${suma.toFixed(2)}</div>
      <div class="etiqueta">Suma total [f₁ + 4f₂ + 2f₃ + ... + f₃₀]</div>
    </div>
    <div class="card-comparacion">
      <div class="numero">÷ 3</div>
      <div class="etiqueta">Dividir entre 3 (h/3 con h=1)</div>
    </div>
  `;
  
  // 5. Desarrollo detallado de la suma
  let desarrolloHtml = `<strong>📐 Aplicando la fórmula de Simpson 1/3:</strong><br>`;
  desarrolloHtml += `Simpson = (1/3) × [f₁ + 4f₂ + 2f₃ + 4f₄ + 2f₅ + ... + 4f₂₉ + f₃₀]<br><br>`;
  desarrolloHtml += `<strong>🔢 Desglose de la suma:</strong><br>`;
  desarrolloHtml += `f₁ (día 1) = ${preciosDiarios[0].toFixed(2)}<br>`;
  
  // Mostrar términos alternados para que se entienda el patrón
  let mostrados = 0;
  for (let det of detalles) {
    if (det.dia !== 1 && det.dia !== 30) {
      if (mostrados < 10 || det.dia > 25) {
        let simbolo = det.coeficiente === 4 ? "4×f" : "2×f";
        desarrolloHtml += `+ ${det.coeficiente}×f${det.dia} = ${det.aporte.toFixed(2)}<br>`;
        mostrados++;
      } else if (mostrados === 10) {
        desarrolloHtml += `<span style="color: #8b6cc9;">... (continuamos con el patrón hasta el día 29) ...</span><br>`;
        mostrados++;
      }
    }
  }
  
  desarrolloHtml += `<strong style="color: #6b4e9e;">Suma total dentro del corchete = ${suma.toFixed(2)}</strong><br><br>`;
  desarrolloHtml += `<strong>✨ Multiplicamos por 1/3:</strong><br>`;
  desarrolloHtml += `Simpson 1/3 = (1/3) × ${suma.toFixed(2)} = <strong style="font-size: 1.2rem; color: #6b4e9e;">${resultado.toFixed(2)} Bs</strong>`;
  
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
  
  // 7. Comparación con Trapecio
  document.getElementById("comparacionPrecision").innerHTML = `
    <div class="card-comparacion">
      <div class="numero">${trapecio.toFixed(2)} Bs</div>
      <div class="etiqueta">📐 Trapecio</div>
      <small>Error O(h²) = 1/12 ≈ 0.0833</small>
    </div>
    <div class="card-comparacion" style="background: linear-gradient(135deg, #6b4e9e20, #8b6cc920); border: 1px solid #8b6cc9;">
      <div class="numero" style="color: #6b4e9e;">${resultado.toFixed(2)} Bs</div>
      <div class="etiqueta">⭐ Simpson 1/3 (MÁS PRECISO)</div>
      <small>Error O(h⁴) = 1/90 ≈ 0.0111</small>
    </div>
  `;
  
  document.getElementById("recomendacionPrecision").innerHTML = `
    <i class="fas fa-chart-line"></i> <strong>Comparativa de precisión:</strong><br>
    📊 Diferencia entre métodos: <strong>${diferencia.toFixed(2)} Bs</strong> (${Math.abs(mejora).toFixed(3)}% de diferencia)<br>
    ⭐ Simpson 1/3 es <strong>${factorPrecision.toFixed(1)} veces más preciso</strong> que el Trapecio porque su error es O(h⁴) en lugar de O(h²).<br>
    ✅ Por esta razón, <strong>Simpson 1/3 es el método recomendado</strong> para calcular el gasto familiar.
  `;
  
  // 8. Interpretación económica
  let interpretacion = "";
  if (escenarioActual === "ideal") {
    interpretacion = `
      <p><i class="fas fa-chart-line"></i> <strong>Estado ideal (+87% de inflación)</strong></p>
      <p>Una familia gasta aproximadamente <strong>${resultado.toFixed(2)} Bs</strong> en papa durante el mes.</p>
      <p>💰 <strong>Comparativa:</strong> Si los precios no hubieran subido, gastarían solo <strong>${sinInflacion.toFixed(2)} Bs</strong>.</p>
      <p>📉 <strong>Pérdida del poder adquisitivo:</strong> ${perdida.toFixed(2)} Bs (${porcentajePerdida.toFixed(0)}% más).</p>
      <p>💡 <strong>Impacto real:</strong> Esta pérdida equivale a aproximadamente <strong>4 almuerzos familiares</strong> o <strong>2 días de transporte público</strong>. Aunque es notable, la situación es manejable.</p>
      <p>⭐ <strong>Ventaja de Simpson 1/3:</strong> Al usar parábolas, obtenemos una estimación más precisa que con el Trapecio, lo que permite mejores decisiones económicas.</p>
    `;
  } else if (escenarioActual === "moderado") {
    interpretacion = `
      <p><i class="fas fa-exclamation-triangle"></i> <strong>Crisis moderada (+300% de inflación)</strong></p>
      <p>Una familia gasta aproximadamente <strong>${resultado.toFixed(2)} Bs</strong> en papa durante el mes.</p>
      <p>💰 <strong>Comparativa:</strong> Sin inflación, gastarían solo <strong>${sinInflacion.toFixed(2)} Bs</strong>.</p>
      <p>📉 <strong>Pérdida del poder adquisitivo:</strong> ${perdida.toFixed(2)} Bs (${porcentajePerdida.toFixed(0)}% más).</p>
      <p>💡 <strong>Impacto real:</strong> Con un salario mínimo de 2,500 Bs, la pérdida del ${porcentajePerdida.toFixed(0)}% significa que la familia necesita ganar <strong>2.5 veces más</strong> solo para mantener el consumo de papa.</p>
      <p>⭐ <strong>Ventaja de Simpson 1/3:</strong> Proporciona una estimación más fiable en escenarios de alta volatilidad de precios.</p>
    `;
  } else {
    interpretacion = `
      <p><i class="fas fa-fire"></i> <strong>Crisis crítica (+680% de inflación)</strong></p>
      <p>Una familia gasta aproximadamente <strong>${resultado.toFixed(2)} Bs</strong> en papa durante el mes.</p>
      <p>💰 <strong>Comparativa:</strong> Sin inflación, gastarían solo <strong>${sinInflacion.toFixed(2)} Bs</strong>.</p>
      <p>📉 <strong>Pérdida del poder adquisitivo:</strong> ${perdida.toFixed(2)} Bs (${porcentajePerdida.toFixed(0)}% más).</p>
      <p>💡 <strong>Impacto real:</strong> Con salario mínimo de 2,500 Bs, la familia destinaría más del <strong>60% de su ingreso</strong> solo a comprar papa. ¡Muchas familias ya no pueden acceder a este alimento básico!</p>
      <p>⭐ <strong>Ventaja de Simpson 1/3:</strong> En situaciones críticas, la precisión extra ayuda a dimensionar correctamente la magnitud del problema.</p>
    `;
  }
  document.getElementById("interpretacionEconomica").innerHTML = interpretacion;
  
  // 9. Gráfica
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