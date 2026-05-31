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

document.addEventListener("DOMContentLoaded", () => {
  configurarBotones();
  actualizarCaso("ideal");

  document.getElementById("btnCompararCasos").addEventListener("click", compararCasos);
  document.getElementById("btnCompararMetodos").addEventListener("click", () => {
    compararMetodos(document.getElementById("comparisonCase").value);
  });

  document.getElementById("comparisonCase").addEventListener("change", () => {
    compararMetodos(document.getElementById("comparisonCase").value);
  });

  compararMetodos("critico");

  window.addEventListener("resize", () => {
    dibujarGrafica3D(casos[casoActual]);
  });
});

function configurarBotones() {
  const botones = document.querySelectorAll(".case-button");

  botones.forEach((boton) => {
    boton.addEventListener("click", () => {
      botones.forEach((b) => b.classList.remove("active"));
      boton.classList.add("active");

      actualizarCaso(boton.getAttribute("data-case"));
    });
  });
}

function actualizarCaso(nombreCaso) {
  casoActual = nombreCaso;
  const caso = casos[nombreCaso];

  const precioEstimado = lagrange(caso.dias, caso.precios, caso.diaEstimado);

  document.getElementById("caseTitle").textContent = caso.titulo;
  document.getElementById("caseDescription").textContent = caso.descripcion;
  document.getElementById("productName").textContent = caso.producto;
  document.getElementById("caseFunction").textContent = caso.funcionCaso;
  document.getElementById("estimateDay").textContent =
    "Estimar precio para el dia " + caso.diaEstimado;

  document.getElementById("estimatedPrice").textContent =
    precioEstimado.toFixed(2) + " Bs";

  document.getElementById("caseInterpretation").textContent =
    caso.interpretacion +
    " Para el dia " +
    caso.diaEstimado +
    ", el precio estimado es aproximadamente " +
    precioEstimado.toFixed(2) +
    " Bs.";

  document.getElementById("justificationText").textContent = caso.justificacion;

  const primero = caso.precios[0];
  const ultimo = caso.precios[caso.precios.length - 1];
  const incremento = ultimo - primero;

  document.getElementById("firstPrice").textContent = primero.toFixed(2) + " Bs";
  document.getElementById("lastPrice").textContent = ultimo.toFixed(2) + " Bs";
  document.getElementById("increaseValue").textContent = incremento.toFixed(2) + " Bs";
  document.getElementById("estimateValue").textContent = "Dia " + caso.diaEstimado;

  document.getElementById("caseConclusion").textContent = caso.conclusion;

  llenarTablaDatos(caso);
  dibujarGrafica3D(caso);
}

function llenarTablaDatos(caso) {
  const cuerpo = document.getElementById("dataTable");
  cuerpo.innerHTML = "";

  caso.dias.forEach((dia, index) => {
    const precio = caso.precios[index];
    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td>${dia}</td>
      <td>${precio.toFixed(2)} Bs</td>
      <td>${obtenerInterpretacionPrecio(index, caso.precios.length)}</td>
    `;

    cuerpo.appendChild(fila);
  });
}

function obtenerInterpretacionPrecio(index, total) {
  if (index === 0) return "Precio inicial registrado.";
  if (index === total - 1) return "Precio final del periodo.";
  return "Dato intermedio usado para interpolar.";
}

function lagrange(xs, ys, x) {
  let resultado = 0;

  for (let i = 0; i < xs.length; i++) {
    let termino = ys[i];

    for (let j = 0; j < xs.length; j++) {
      if (i !== j) {
        termino *= (x - xs[j]) / (xs[i] - xs[j]);
      }
    }

    resultado += termino;
  }

  return resultado;
}

function newtonInterpolacion(xs, ys, x) {
  const n = xs.length;
  const coef = ys.slice();

  for (let j = 1; j < n; j++) {
    for (let i = n - 1; i >= j; i--) {
      coef[i] = (coef[i] - coef[i - 1]) / (xs[i] - xs[i - j]);
    }
  }

  let resultado = coef[n - 1];

  for (let i = n - 2; i >= 0; i--) {
    resultado = resultado * (x - xs[i]) + coef[i];
  }

  return resultado;
}

function splineCubicoNatural(xs, ys, x) {
  const n = xs.length;
  const a = ys.slice();
  const b = new Array(n - 1).fill(0);
  const d = new Array(n - 1).fill(0);
  const h = new Array(n - 1);

  for (let i = 0; i < n - 1; i++) {
    h[i] = xs[i + 1] - xs[i];
  }

  const alpha = new Array(n).fill(0);

  for (let i = 1; i < n - 1; i++) {
    alpha[i] =
      (3 / h[i]) * (a[i + 1] - a[i]) -
      (3 / h[i - 1]) * (a[i] - a[i - 1]);
  }

  const c = new Array(n).fill(0);
  const l = new Array(n).fill(0);
  const mu = new Array(n).fill(0);
  const z = new Array(n).fill(0);

  l[0] = 1;
  mu[0] = 0;
  z[0] = 0;

  for (let i = 1; i < n - 1; i++) {
    l[i] = 2 * (xs[i + 1] - xs[i - 1]) - h[i - 1] * mu[i - 1];
    mu[i] = h[i] / l[i];
    z[i] = (alpha[i] - h[i - 1] * z[i - 1]) / l[i];
  }

  l[n - 1] = 1;
  z[n - 1] = 0;
  c[n - 1] = 0;

  for (let j = n - 2; j >= 0; j--) {
    c[j] = z[j] - mu[j] * c[j + 1];
    b[j] =
      (a[j + 1] - a[j]) / h[j] -
      (h[j] * (c[j + 1] + 2 * c[j])) / 3;
    d[j] = (c[j + 1] - c[j]) / (3 * h[j]);
  }

  let i = n - 2;

  for (let j = 0; j < n - 1; j++) {
    if (x >= xs[j] && x <= xs[j + 1]) {
      i = j;
      break;
    }
  }

  const dx = x - xs[i];
  return a[i] + b[i] * dx + c[i] * dx * dx + d[i] * dx * dx * dx;
}

function compararMetodos(nombreCaso) {
  const caso = casos[nombreCaso];
  const x = caso.diaEstimado;

  const rLagrange = lagrange(caso.dias, caso.precios, x);
  const rNewton = newtonInterpolacion(caso.dias, caso.precios, x);
  const rSpline = splineCubicoNatural(caso.dias, caso.precios, x);

  const promedio = (rLagrange + rNewton + rSpline) / 3;

  const resultados = [
    {
      metodo: "Lagrange",
      datos: caso.dias.length + " puntos",
      convergio: true,
      x,
      precio: rLagrange,
      diferencia: Math.abs(rLagrange - promedio)
    },
    {
      metodo: "Newton Interpolacion",
      datos: caso.dias.length + " puntos",
      convergio: true,
      x,
      precio: rNewton,
      diferencia: Math.abs(rNewton - promedio)
    },
    {
      metodo: "Splines Cubicos",
      datos: caso.dias.length - 1 + " tramos",
      convergio: true,
      x,
      precio: rSpline,
      diferencia: Math.abs(rSpline - promedio)
    }
  ];

  const cuerpo = document.getElementById("tablaComparacionMetodos");
  cuerpo.innerHTML = "";

  resultados.forEach((r) => {
    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td>${r.metodo}</td>
      <td>${r.datos}</td>
      <td>${r.convergio ? '<span class="ok">✔</span>' : '<span class="no">✖</span>'}</td>
      <td>${r.x}</td>
      <td>${r.precio.toFixed(4)} Bs</td>
      <td>${r.diferencia.toFixed(6)}</td>
    `;

    cuerpo.appendChild(fila);
  });

  const masEstable = resultados.reduce((mejor, actual) => {
    return actual.diferencia < mejor.diferencia ? actual : mejor;
  });

  document.getElementById("comparisonSummary").textContent =
    "Escenario seleccionado: " +
    caso.titulo +
    ". Los metodos estiman el precio para el dia " +
    x +
    ". El resultado promedio aproximado es " +
    promedio.toFixed(4) +
    " Bs. El metodo mas estable respecto al promedio fue " +
    masEstable.metodo +
    " con una diferencia de " +
    masEstable.diferencia.toFixed(6) +
    ".";
}

function compararCasos() {
  const cuerpo = document.getElementById("comparisonTable");
  cuerpo.innerHTML = "";

  ["ideal", "moderado", "critico"].forEach((nombre) => {
    const caso = casos[nombre];
    const precio = lagrange(caso.dias, caso.precios, caso.diaEstimado);
    const incremento = caso.precios[caso.precios.length - 1] - caso.precios[0];

    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td>${caso.titulo}</td>
      <td>${caso.producto}</td>
      <td>${caso.diaEstimado}</td>
      <td>${precio.toFixed(2)} Bs</td>
      <td>${incremento.toFixed(2)} Bs</td>
      <td>${caso.interpretacion}</td>
    `;

    cuerpo.appendChild(fila);
  });
}

function nivelCrisis(precio, precios) {
  const min = Math.min(...precios);
  const max = Math.max(...precios);

  if (precio < min + (max - min) * 0.4) return 1;
  if (precio < min + (max - min) * 0.75) return 2;
  return 3;
}

function dibujarGrafica3D(caso) {
  const canvas = document.getElementById("interpolationGraph");
  const contenedor = canvas.parentElement;

  const ancho = Math.max(contenedor.clientWidth - 32, 320);
  const alto = 430;

  canvas.width = ancho;
  canvas.height = alto;

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, ancho, alto);

  const origenX = ancho * 0.13;
  const origenY = alto * 0.78;

  const escalaX = ancho < 600 ? 9 : 16;
  const escalaY = ancho < 600 ? 4.2 : 6.2;
  const escalaZ = ancho < 600 ? 12 : 17;

  const minPrecio = Math.min(...caso.precios);
  const maxPrecio = Math.max(...caso.precios);

  function punto3D(x, y, z) {
    return {
      x: origenX + x * escalaX + z * escalaZ,
      y: origenY - (y - minPrecio) * escalaY - z * escalaZ * 0.55
    };
  }

  dibujarPlanoBase(ctx, origenX, origenY, escalaX, escalaZ);
  dibujarEjes(ctx, punto3D, origenX, origenY, maxPrecio, minPrecio);
  dibujarCurvaInterpolada(ctx, caso, punto3D);
  dibujarPuntosDatos(ctx, caso, punto3D);
  dibujarPuntoEstimado(ctx, caso, punto3D);
  dibujarLeyenda(ctx, caso);
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

  ctx.fillStyle = "#6b7280";
  ctx.font = "12px Segoe UI";

  for (let x = 0; x <= 30; x += 5) {
    const p = punto3D(x, minPrecio, 0);
    ctx.fillText(x.toString(), p.x - 4, p.y + 18);
  }
}

function dibujarCurvaInterpolada(ctx, caso, punto3D) {
  ctx.beginPath();
  ctx.lineWidth = 5;
  ctx.strokeStyle = "#10b981";

  let primero = true;

  for (let x = 1; x <= 30; x += 0.2) {
    const y = splineCubicoNatural(caso.dias, caso.precios, x);
    const z = nivelCrisis(y, caso.precios);
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

function dibujarPuntosDatos(ctx, caso, punto3D) {
  caso.dias.forEach((dia, index) => {
    const precio = caso.precios[index];
    const z = nivelCrisis(precio, caso.precios);
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

function dibujarPuntoEstimado(ctx, caso, punto3D) {
  const precio = splineCubicoNatural(caso.dias, caso.precios, caso.diaEstimado);
  const z = nivelCrisis(precio, caso.precios);
  const p = punto3D(caso.diaEstimado, precio, z);

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
  ctx.fillText("P(" + caso.diaEstimado + ") ≈ " + precio.toFixed(2), p.x + 10, p.y - 12);
}

function dibujarLeyenda(ctx, caso) {
  ctx.fillStyle = "#111827";
  ctx.font = "bold 14px Segoe UI";
  ctx.fillText("Modulo 3 - Grafica 3D aproximada de Interpolacion", 20, 30);

  ctx.font = "12px Segoe UI";
  ctx.fillStyle = "#6b7280";
  ctx.fillText("Eje X: dias | Eje Y: precio | Eje Z: nivel de incremento", 20, 52);

  ctx.fillStyle = "#10b981";
  ctx.fillRect(20, 70, 14, 14);
  ctx.fillStyle = "#374151";
  ctx.fillText("Curva interpolada aproximada", 42, 82);

  ctx.fillStyle = "#2563eb";
  ctx.beginPath();
  ctx.arc(27, 104, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#374151";
  ctx.fillText("Datos reales conocidos", 42, 108);

  ctx.fillStyle = "#dc2626";
  ctx.beginPath();
  ctx.arc(27, 128, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#374151";
  ctx.fillText("Precio estimado", 42, 132);

  ctx.fillStyle = "#111827";
  ctx.font = "bold 12px Segoe UI";
  ctx.fillText(caso.titulo, 20, 156);
}