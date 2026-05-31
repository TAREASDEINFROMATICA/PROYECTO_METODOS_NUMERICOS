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
  const resultado = calcularSplineCubicoNatural(datos.dias, datos.precios, datos.x);
  ultimoResultado = resultado;

  mostrarResultado(resultado, datos);
  mostrarTabla(resultado);
  dibujarGrafica3D(datos, resultado);
}

function ordenarDatos(xs, ys) {
  const pares = xs.map((x, i) => ({ x, y: ys[i] }));
  pares.sort((a, b) => a.x - b.x);

  return {
    xs: pares.map(p => p.x),
    ys: pares.map(p => p.y)
  };
}

function calcularSplineCubicoNatural(xsOriginal, ysOriginal, x) {
  if (xsOriginal.length !== ysOriginal.length || xsOriginal.length < 3) {
    return {
      precio: NaN,
      estado: false,
      mensaje: "Los datos no son validos. Para Splines se necesitan al menos 3 puntos.",
      coeficientes: [],
      xs: [],
      ys: [],
      x
    };
  }

  if (
    xsOriginal.some(v => !Number.isFinite(v)) ||
    ysOriginal.some(v => !Number.isFinite(v)) ||
    !Number.isFinite(x)
  ) {
    return {
      precio: NaN,
      estado: false,
      mensaje: "Existen valores vacios o no numericos.",
      coeficientes: [],
      xs: [],
      ys: [],
      x
    };
  }

  const ordenados = ordenarDatos(xsOriginal, ysOriginal);
  const xs = ordenados.xs;
  const ys = ordenados.ys;

  for (let i = 1; i < xs.length; i++) {
    if (xs[i] === xs[i - 1]) {
      return {
        precio: NaN,
        estado: false,
        mensaje: "No se pueden repetir dias.",
        coeficientes: [],
        xs,
        ys,
        x
      };
    }
  }

  if (x < xs[0] || x > xs[xs.length - 1]) {
    return {
      precio: NaN,
      estado: false,
      mensaje: "El dia a estimar esta fuera del rango de datos conocidos.",
      coeficientes: [],
      xs,
      ys,
      x
    };
  }

  const n = xs.length - 1;
  const a = ys.slice();
  const b = new Array(n).fill(0);
  const c = new Array(n + 1).fill(0);
  const d = new Array(n).fill(0);
  const h = new Array(n).fill(0);

  for (let i = 0; i < n; i++) {
    h[i] = xs[i + 1] - xs[i];
  }

  const alpha = new Array(n + 1).fill(0);

  for (let i = 1; i < n; i++) {
    alpha[i] =
      (3 / h[i]) * (a[i + 1] - a[i]) -
      (3 / h[i - 1]) * (a[i] - a[i - 1]);
  }

  const l = new Array(n + 1).fill(0);
  const mu = new Array(n + 1).fill(0);
  const z = new Array(n + 1).fill(0);

  l[0] = 1;
  mu[0] = 0;
  z[0] = 0;

  for (let i = 1; i < n; i++) {
    l[i] = 2 * (xs[i + 1] - xs[i - 1]) - h[i - 1] * mu[i - 1];
    mu[i] = h[i] / l[i];
    z[i] = (alpha[i] - h[i - 1] * z[i - 1]) / l[i];
  }

  l[n] = 1;
  z[n] = 0;
  c[n] = 0;

  for (let j = n - 1; j >= 0; j--) {
    c[j] = z[j] - mu[j] * c[j + 1];
    b[j] =
      (a[j + 1] - a[j]) / h[j] -
      (h[j] * (c[j + 1] + 2 * c[j])) / 3;
    d[j] = (c[j + 1] - c[j]) / (3 * h[j]);
  }

  const coeficientes = [];

  for (let i = 0; i < n; i++) {
    coeficientes.push({
      tramo: i,
      xi: xs[i],
      xsiguiente: xs[i + 1],
      a: a[i],
      b: b[i],
      c: c[i],
      d: d[i]
    });
  }

  const intervalo = buscarIntervalo(coeficientes, x);
  const precio = evaluarSplineEnIntervalo(intervalo, x);

  return {
    precio,
    estado: true,
    mensaje: "El calculo por Splines Cubicos se realizo correctamente.",
    coeficientes,
    xs,
    ys,
    x,
    intervaloUsado: intervalo.tramo
  };
}

function buscarIntervalo(coeficientes, x) {
  for (let i = 0; i < coeficientes.length; i++) {
    const tramo = coeficientes[i];

    if (x >= tramo.xi && x <= tramo.xsiguiente) {
      return tramo;
    }
  }

  return coeficientes[coeficientes.length - 1];
}

function evaluarSplineEnIntervalo(tramo, x) {
  const dx = x - tramo.xi;
  return (
    tramo.a +
    tramo.b * dx +
    tramo.c * dx * dx +
    tramo.d * dx * dx * dx
  );
}

function evaluarSpline(resultado, x) {
  const tramo = buscarIntervalo(resultado.coeficientes, x);
  return evaluarSplineEnIntervalo(tramo, x);
}

function mostrarResultado(resultado, datos) {
  document.getElementById("resultadoX").textContent = Number.isFinite(datos.x) ? "Dia " + datos.x : "-";

  document.getElementById("resultadoPrecio").textContent = Number.isFinite(resultado.precio)
    ? resultado.precio.toFixed(4) + " Bs"
    : "No definido";

  document.getElementById("resultadoTramos").textContent =
    resultado.estado ? resultado.coeficientes.length : "-";

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
    " Bs. Este valor se obtiene usando el tramo " +
    resultado.intervaloUsado +
    " del spline cubico.";
}

function mostrarTabla(resultado) {
  const cuerpo = document.getElementById("tablaSplines");
  cuerpo.innerHTML = "";

  if (!resultado.estado) {
    cuerpo.innerHTML = `<tr><td colspan="7">${resultado.mensaje}</td></tr>`;
    return;
  }

  resultado.coeficientes.forEach((tramo) => {
    const fila = document.createElement("tr");
    const usado = tramo.tramo === resultado.intervaloUsado ? "Si" : "No";

    fila.innerHTML = `
      <td>${tramo.tramo}</td>
      <td>[${tramo.xi.toFixed(2)}, ${tramo.xsiguiente.toFixed(2)}]</td>
      <td>${tramo.a.toFixed(6)}</td>
      <td>${tramo.b.toFixed(6)}</td>
      <td>${tramo.c.toFixed(6)}</td>
      <td>${tramo.d.toFixed(6)}</td>
      <td>${usado}</td>
    `;

    cuerpo.appendChild(fila);
  });
}

function compararCasos() {
  const cuerpo = document.getElementById("tablaComparacionCasos");
  cuerpo.innerHTML = "";

  ["ideal", "moderado", "critico"].forEach((nombre) => {
    const caso = casos[nombre];
    const resultado = calcularSplineCubicoNatural(caso.dias, caso.precios, caso.diaEstimado);
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
        "En el estado ideal se analiza un mercado estable. La curva spline crece suavemente porque los precios aumentan poco a poco.",
      conclusion:
        "En este caso, Splines muestra una curva suave y estable, adecuada para representar una subida controlada."
    },
    moderado: {
      texto:
        "En la crisis moderada existe mayor presion sobre los precios. La curva spline refleja una subida mas marcada.",
      conclusion:
        "En este caso, Splines permite representar el aumento de precios por tramos sin generar saltos bruscos."
    },
    critico: {
      texto:
        "En la crisis critica existe escasez y aumento acelerado. Los precios crecen con mayor fuerza durante el mes.",
      conclusion:
        "En este caso, Splines muestra una curva ascendente fuerte, pero mantiene suavidad entre los datos conocidos."
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
  const canvas = document.getElementById("splinesGraph");
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

  const xs = resultado.xs;
  const ys = resultado.ys;

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
  dibujarCurva(ctx, resultado, punto3D);
  dibujarPuntos(ctx, resultado, punto3D);
  dibujarPuntoEstimado(ctx, resultado, punto3D);
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

function dibujarCurva(ctx, resultado, punto3D) {
  ctx.beginPath();
  ctx.lineWidth = 5;
  ctx.strokeStyle = "#10b981";

  let primero = true;
  const minX = resultado.xs[0];
  const maxX = resultado.xs[resultado.xs.length - 1];

  for (let x = minX; x <= maxX; x += 0.2) {
    const y = evaluarSpline(resultado, x);
    const z = nivelCrisis(y, resultado.ys);
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

function dibujarPuntos(ctx, resultado, punto3D) {
  resultado.xs.forEach((dia, index) => {
    const precio = resultado.ys[index];
    const z = nivelCrisis(precio, resultado.ys);
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

function dibujarPuntoEstimado(ctx, resultado, punto3D) {
  const precio = resultado.precio;
  const z = nivelCrisis(precio, resultado.ys);
  const p = punto3D(resultado.x, precio, z);

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
  ctx.fillText("S(" + resultado.x + ") ≈ " + precio.toFixed(2), p.x + 10, p.y - 12);
}

function dibujarLeyenda(ctx) {
  ctx.fillStyle = "#111827";
  ctx.font = "bold 14px Segoe UI";
  ctx.fillText("Splines Cubicos - Grafica 3D aproximada", 20, 30);

  ctx.font = "12px Segoe UI";
  ctx.fillStyle = "#6b7280";
  ctx.fillText("Eje X: dias | Eje Y: precio | Eje Z: nivel de incremento", 20, 52);

  ctx.fillStyle = "#10b981";
  ctx.fillRect(20, 70, 14, 14);
  ctx.fillStyle = "#374151";
  ctx.fillText("Curva por Splines Cubicos", 42, 82);

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