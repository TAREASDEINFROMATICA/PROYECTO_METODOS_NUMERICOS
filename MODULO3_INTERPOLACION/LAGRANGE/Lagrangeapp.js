const casos = {
  ideal: {
    titulo: "Caso I: Estado ideal",
    producto: "Precio de la papa",
    descripcion:
      "Mercado estable. Los precios suben lentamente, pero no de forma completamente lineal. Existe una variacion suave durante el mes.",
    funcionCaso:
      "P(x): curva aproximada del precio de la papa en un escenario estable.",
    dias: [1, 4, 8, 13, 19, 30],
    precios: [7.8, 8.1, 8.9, 10.2, 11.8, 14.6],
    diaEstimado: 16,
    justificacion:
      "Se eligieron datos con crecimiento suave para que la curva no sea totalmente recta. El precio sube poco a poco porque existe abastecimiento normal y baja especulacion.",
    conclusion:
      "La curva del caso ideal crece lentamente. El precio estimado se mantiene dentro de un rango manejable.",
    interpretacion:
      "En el estado ideal, el precio aumenta de manera controlada y la familia conserva mayor poder adquisitivo."
  },

  moderado: {
    titulo: "Caso II: Crisis moderada",
    producto: "Precio del arroz",
    descripcion:
      "Crisis intermedia. Los precios empiezan a subir con mayor fuerza por rumores, menor abastecimiento y aumento de demanda.",
    funcionCaso:
      "P(x): curva aproximada del precio del arroz durante una crisis moderada.",
    dias: [1, 4, 8, 13, 19, 30],
    precios: [8.5, 9.4, 11.8, 16.2, 22.5, 34],
    diaEstimado: 17,
    justificacion:
      "Se eligieron precios con crecimiento mas acelerado para representar una crisis moderada. Al inicio el aumento es leve, pero despues del dia 13 la subida se vuelve mas evidente.",
    conclusion:
      "La curva del caso moderado muestra una subida mas marcada que el caso ideal.",
    interpretacion:
      "En crisis moderada, los precios suben mas rapido y la familia necesita gastar mas para comprar el mismo producto."
  },

  critico: {
    titulo: "Caso III: Crisis critica",
    producto: "Precio del aceite",
    descripcion:
      "Crisis fuerte. Existe escasez, compras por panico, especulacion y aumento acelerado del precio.",
    funcionCaso:
      "P(x): curva aproximada del precio del aceite en un escenario critico de escasez.",
    dias: [1, 4, 8, 13, 19, 30],
    precios: [10, 13, 19, 29, 44, 78],
    diaEstimado: 24,
    justificacion:
      "Se eligieron precios mucho mas altos porque el caso critico representa escasez fuerte y compras por panico. La curva debe verse mas pronunciada para mostrar la gravedad del escenario.",
    conclusion:
      "La curva del caso critico crece rapidamente, mostrando perdida fuerte del poder adquisitivo.",
    interpretacion:
      "En crisis critica, el precio aumenta mucho mas rapido y el producto se vuelve menos accesible para la familia."
  }
};

let casoActual = "ideal";
let ultimoResultado = null;

document.addEventListener("DOMContentLoaded", () => {
  configurarBotonesCasos();

  document.getElementById("btnCalcular").addEventListener("click", calcularCasoActual);
  document.getElementById("btnCompararCasos").addEventListener("click", compararCasos);

  actualizarCaso("ideal");
  calcularCasoActual();

  window.addEventListener("resize", () => {
    dibujarGrafica3D(obtenerDatosDesdeFormulario(), ultimoResultado);
  });
});

function configurarBotonesCasos() {
  const botones = document.querySelectorAll(".case-button");

  botones.forEach((boton) => {
    boton.addEventListener("click", () => {
      botones.forEach((b) => b.classList.remove("active"));
      boton.classList.add("active");

      const caso = boton.getAttribute("data-case");
      actualizarCaso(caso);
      calcularCasoActual();
    });
  });
}

function actualizarCaso(nombreCaso) {
  casoActual = nombreCaso;
  const caso = casos[nombreCaso];

  document.getElementById("caseTitle").textContent = caso.titulo;
  document.getElementById("caseDescription").textContent = caso.descripcion;
  document.getElementById("productName").textContent = caso.producto;
  document.getElementById("caseFunction").textContent = caso.funcionCaso;
  document.getElementById("caseInterpretation").textContent = caso.interpretacion;

  document.getElementById("inputDias").value = caso.dias.join(",");
  document.getElementById("inputPrecios").value = caso.precios.join(",");
  document.getElementById("inputX").value = caso.diaEstimado;

  actualizarInterpretacionVariables(nombreCaso);
}

function obtenerDatosDesdeFormulario() {
  const dias = document.getElementById("inputDias").value
    .split(",")
    .map(v => parseFloat(v.trim()));

  const precios = document.getElementById("inputPrecios").value
    .split(",")
    .map(v => parseFloat(v.trim()));

  const x = parseFloat(document.getElementById("inputX").value);

  return {
    dias,
    precios,
    x
  };
}

function calcularCasoActual() {
  const datos = obtenerDatosDesdeFormulario();
  const resultado = calcularLagrange(datos.dias, datos.precios, datos.x);
  ultimoResultado = resultado;

  mostrarResultado(resultado, datos);
  mostrarTabla(resultado.tabla);
  dibujarGrafica3D(datos, resultado);
}

function calcularLagrange(xs, ys, x) {
  const tabla = [];

  if (xs.length !== ys.length || xs.length < 2) {
    return {
      precio: NaN,
      estado: false,
      mensaje: "Los datos no son validos. Debe existir la misma cantidad de dias y precios.",
      tabla
    };
  }

  if (xs.some(v => !Number.isFinite(v)) || ys.some(v => !Number.isFinite(v)) || !Number.isFinite(x)) {
    return {
      precio: NaN,
      estado: false,
      mensaje: "Existen valores vacios o no numericos.",
      tabla
    };
  }

  let resultado = 0;

  for (let i = 0; i < xs.length; i++) {
    let Li = 1;

    for (let j = 0; j < xs.length; j++) {
      if (i !== j) {
        Li *= (x - xs[j]) / (xs[i] - xs[j]);
      }
    }

    const aporte = ys[i] * Li;
    resultado += aporte;

    tabla.push({
      i,
      xi: xs[i],
      yi: ys[i],
      Li,
      aporte
    });
  }

  return {
    precio: resultado,
    estado: true,
    mensaje: "El calculo por Lagrange se realizo correctamente.",
    tabla
  };
}

function mostrarResultado(resultado, datos) {
  document.getElementById("resultadoX").textContent = Number.isFinite(datos.x) ? "Dia " + datos.x : "-";
  document.getElementById("resultadoPrecio").textContent = Number.isFinite(resultado.precio)
    ? resultado.precio.toFixed(4) + " Bs"
    : "No definido";

  document.getElementById("resultadoPuntos").textContent = datos.dias.length;

  const estado = document.getElementById("resultadoEstado");
  estado.textContent = resultado.estado ? "Correcto" : "Error";
  estado.className = resultado.estado ? "ok" : "no";

  const analisis = document.getElementById("analisisResultado");

  if (!resultado.estado) {
    analisis.textContent = resultado.mensaje;
    return;
  }

  analisis.textContent =
    resultado.mensaje +
    " El precio estimado para el dia " +
    datos.x +
    " es aproximadamente " +
    resultado.precio.toFixed(4) +
    " Bs. Este valor representa una aproximacion basada en los precios conocidos.";
}

function mostrarTabla(tabla) {
  const cuerpo = document.getElementById("tablaLagrange");
  cuerpo.innerHTML = "";

  if (tabla.length === 0) {
    cuerpo.innerHTML = `<tr><td colspan="5">No hay datos para mostrar.</td></tr>`;
    return;
  }

  tabla.forEach((fila) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${fila.i}</td>
      <td>${fila.xi.toFixed(4)}</td>
      <td>${fila.yi.toFixed(4)}</td>
      <td>${fila.Li.toFixed(6)}</td>
      <td>${fila.aporte.toFixed(6)}</td>
    `;

    cuerpo.appendChild(tr);
  });
}

function compararCasos() {
  const cuerpo = document.getElementById("tablaComparacionCasos");
  cuerpo.innerHTML = "";

  ["ideal", "moderado", "critico"].forEach((nombre) => {
    const caso = casos[nombre];
    const resultado = calcularLagrange(caso.dias, caso.precios, caso.diaEstimado);
    const incremento = caso.precios[caso.precios.length - 1] - caso.precios[0];

    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td>${caso.titulo}</td>
      <td>${caso.producto}</td>
      <td>${caso.diaEstimado}</td>
      <td>${resultado.precio.toFixed(4)} Bs</td>
      <td>${incremento.toFixed(2)} Bs</td>
      <td>${caso.interpretacion}</td>
    `;

    cuerpo.appendChild(fila);
  });
}

function actualizarInterpretacionVariables(nombreCaso) {
  const caso = casos[nombreCaso];

  const datos = {
    ideal: {
      texto:
        "En el estado ideal se analiza un mercado estable. Los precios aumentan lentamente y la curva interpolada no presenta cambios bruscos.",
      conclusion:
        "En este caso, Lagrange permite estimar el precio faltante de forma directa usando todos los datos conocidos."
    },
    moderado: {
      texto:
        "En la crisis moderada existe mayor presion sobre los precios. La curva interpolada muestra una subida mas visible.",
      conclusion:
        "En este caso, Lagrange permite observar como el precio aumenta con mayor fuerza respecto al estado ideal."
    },
    critico: {
      texto:
        "En la crisis critica existe escasez y aumento acelerado. Los precios crecen rapidamente durante el mes.",
      conclusion:
        "En este caso, Lagrange estima un precio mas alto, mostrando que el producto se vuelve menos accesible."
    }
  };

  document.getElementById("variablesCaseTitle").textContent = caso.titulo;
  document.getElementById("variablesCaseText").textContent = datos[nombreCaso].texto;
  document.getElementById("variablesConclusion").textContent = datos[nombreCaso].conclusion;
}

function nivelCrisis(precio, precios) {
  const min = Math.min(...precios);
  const max = Math.max(...precios);

  if (precio < min + (max - min) * 0.4) return 1;
  if (precio < min + (max - min) * 0.75) return 2;
  return 3;
}

function dibujarGrafica3D(datos, resultado) {
  const canvas = document.getElementById("lagrangeGraph");
  const contenedor = canvas.parentElement;

  const ancho = Math.max(contenedor.clientWidth - 32, 320);
  const alto = 430;

  canvas.width = ancho;
  canvas.height = alto;

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, ancho, alto);

  if (!resultado || !resultado.estado) {
    ctx.fillStyle = "#dc2626";
    ctx.font = "bold 16px Segoe UI";
    ctx.fillText("No se puede graficar porque los datos no son validos.", 30, 50);
    return;
  }

  const xs = datos.dias;
  const ys = datos.precios;

  const origenX = ancho * 0.13;
  const origenY = alto * 0.78;

  const escalaX = ancho < 600 ? 9 : 16;
  const escalaY = ancho < 600 ? 4.2 : 6.2;
  const escalaZ = ancho < 600 ? 12 : 17;

  const minPrecio = Math.min(...ys);
  const maxPrecio = Math.max(...ys);

  function punto3D(x, y, z) {
    return {
      x: origenX + x * escalaX + z * escalaZ,
      y: origenY - (y - minPrecio) * escalaY - z * escalaZ * 0.55
    };
  }

  dibujarPlanoBase(ctx, origenX, origenY, escalaX, escalaZ);
  dibujarEjes(ctx, punto3D, origenX, origenY, maxPrecio, minPrecio);
  dibujarCurva(ctx, datos, punto3D);
  dibujarPuntos(ctx, datos, punto3D);
  dibujarPuntoEstimado(ctx, datos, resultado, punto3D);
  dibujarLeyenda(ctx);
}

function dibujarPlanoBase(ctx, origenX, origenY, escalaX, escalaZ) {
  ctx.fillStyle = "rgba(16, 185, 129, 0.06)";
  ctx.beginPath();
  ctx.moveTo(origenX, origenY);
  ctx.lineTo(origenX + 32 * escalaX, origenY);
  ctx.lineTo(origenX + 32 * escalaX + 5 * escalaZ, origenY - 5 * escalaZ * 0.55);
  ctx.lineTo(origenX + 5 * escalaZ, origenY - 5 * escalaZ * 0.55);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 1;

  for (let i = 0; i <= 32; i += 4) {
    const x1 = origenX + i * escalaX;
    const y1 = origenY;
    const x2 = x1 + 5 * escalaZ;
    const y2 = origenY - 5 * escalaZ * 0.55;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  for (let z = 0; z <= 5; z++) {
    const x1 = origenX + z * escalaZ;
    const y1 = origenY - z * escalaZ * 0.55;
    const x2 = origenX + 32 * escalaX + z * escalaZ;
    const y2 = origenY - z * escalaZ * 0.55;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}

function dibujarEjes(ctx, punto3D, origenX, origenY, maxPrecio, minPrecio) {
  const ejeX = punto3D(32, minPrecio, 0);
  const ejeY = punto3D(0, maxPrecio + 6, 0);
  const ejeZ = punto3D(0, minPrecio, 5);

  ctx.lineWidth = 2;
  ctx.strokeStyle = "#111827";

  ctx.beginPath();
  ctx.moveTo(origenX, origenY);
  ctx.lineTo(ejeX.x, ejeX.y);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(origenX, origenY);
  ctx.lineTo(ejeY.x, ejeY.y);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(origenX, origenY);
  ctx.lineTo(ejeZ.x, ejeZ.y);
  ctx.stroke();

  ctx.fillStyle = "#374151";
  ctx.font = "bold 13px Segoe UI";
  ctx.fillText("x = dias", ejeX.x - 20, ejeX.y + 25);
  ctx.fillText("precio Bs", ejeY.x - 55, ejeY.y - 10);
  ctx.fillText("nivel", ejeZ.x + 10, ejeZ.y - 8);
}

function dibujarCurva(ctx, datos, punto3D) {
  ctx.beginPath();
  ctx.lineWidth = 5;
  ctx.strokeStyle = "#10b981";

  let primero = true;
  const minX = Math.min(...datos.dias);
  const maxX = Math.max(...datos.dias);

  for (let x = minX; x <= maxX; x += 0.2) {
    const r = calcularLagrange(datos.dias, datos.precios, x);
    const y = r.precio;
    const z = nivelCrisis(y, datos.precios);
    const p = punto3D(x, y, z);

    if (primero) {
      ctx.moveTo(p.x, p.y);
      primero = false;
    } else {
      ctx.lineTo(p.x, p.y);
    }
  }

  ctx.stroke();
}

function dibujarPuntos(ctx, datos, punto3D) {
  datos.dias.forEach((dia, index) => {
    const precio = datos.precios[index];
    const z = nivelCrisis(precio, datos.precios);
    const p = punto3D(dia, precio, z);

    ctx.beginPath();
    ctx.fillStyle = "#2563eb";
    ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#1e3a8a";
    ctx.font = "bold 12px Segoe UI";
    ctx.fillText("(" + dia + ", " + precio + ")", p.x + 8, p.y - 8);
  });
}

function dibujarPuntoEstimado(ctx, datos, resultado, punto3D) {
  const precio = resultado.precio;
  const z = nivelCrisis(precio, datos.precios);
  const p = punto3D(datos.x, precio, z);

  ctx.beginPath();
  ctx.strokeStyle = "#dc2626";
  ctx.setLineDash([6, 6]);
  ctx.lineWidth = 2;
  ctx.moveTo(p.x, p.y);
  ctx.lineTo(p.x, p.y + 90);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.beginPath();
  ctx.fillStyle = "#dc2626";
  ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#dc2626";
  ctx.font = "bold 14px Segoe UI";
  ctx.fillText("P(" + datos.x + ") ≈ " + precio.toFixed(2), p.x + 10, p.y - 12);
}

function dibujarLeyenda(ctx) {
  ctx.fillStyle = "#111827";
  ctx.font = "bold 14px Segoe UI";
  ctx.fillText("Metodo de Lagrange - Grafica 3D aproximada", 20, 30);

  ctx.font = "12px Segoe UI";
  ctx.fillStyle = "#6b7280";
  ctx.fillText("Eje X: dias | Eje Y: precio | Eje Z: nivel de incremento", 20, 52);

  ctx.fillStyle = "#10b981";
  ctx.fillRect(20, 70, 14, 14);
  ctx.fillStyle = "#374151";
  ctx.fillText("Curva interpolada de Lagrange", 42, 82);

  ctx.fillStyle = "#2563eb";
  ctx.beginPath();
  ctx.arc(27, 104, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#374151";
  ctx.fillText("Datos conocidos", 42, 108);

  ctx.fillStyle = "#dc2626";
  ctx.beginPath();
  ctx.arc(27, 128, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#374151";
  ctx.fillText("Precio estimado", 42, 132);
}