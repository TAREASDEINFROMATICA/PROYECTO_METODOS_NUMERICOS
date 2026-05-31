const casos = {
  ideal: {
    titulo: "Caso I: Estado ideal",
    descripcion:
      "Situacion controlada. Los precios suben lentamente, no existe panico de compra y el gasto familiar crece de forma moderada.",

    diariaTexto:
      "C(x) = 35 + 0.8x + 4ln(x + 1) + 1.5sen(0.3x)",

    funcionTexto:
      "f(x) = 35x + 0.4x² + 4[(x + 1)ln(x + 1) - x] + 5[1 - cos(0.3x)] - 700",

    f: function (x) {
      return (
        35 * x +
        0.4 * x * x +
        4 * ((x + 1) * Math.log(x + 1) - x) +
        5 * (1 - Math.cos(0.3 * x)) -
        700
      );
    },

    x0: 0,
    x1: 30,

    interpretacion:
      "En el estado ideal, el sistema resiste mas tiempo porque el gasto crece de forma controlada."
  },

  moderado: {
    titulo: "Caso II: Crisis moderada",
    descripcion:
      "Situacion intermedia. Los precios aumentan con mayor velocidad, la reserva empieza a disminuir y la familia se acerca mas rapido a su limite economico.",

    diariaTexto:
      "C(x) = 45 + 1.6x + 8ln(x + 1) + 5e^(0.05x) + 3sen(0.5x)",

    funcionTexto:
      "f(x) = 45x + 0.8x² + 8[(x + 1)ln(x + 1) - x] + 100[e^(0.05x) - 1] + 6[1 - cos(0.5x)] - 900",

    f: function (x) {
      return (
        45 * x +
        0.8 * x * x +
        8 * ((x + 1) * Math.log(x + 1) - x) +
        100 * (Math.exp(0.05 * x) - 1) +
        6 * (1 - Math.cos(0.5 * x)) -
        900
      );
    },

    x0: 0,
    x1: 30,

    interpretacion:
      "En crisis moderada, el gasto crece mas rapido y por eso el punto critico aparece antes."
  },

  critico: {
    titulo: "Caso III: Crisis critica",
    descripcion:
      "Crisis fuerte. Existe panico de compra, reduccion de stock, incremento artificial de demanda y aumento rapido de precios.",

    diariaTexto:
      "C(x) = 55 + 2.5x + 0.2x² + 12ln(x + 1) + 12e^(0.08x) + 5sen(0.6x)",

    funcionTexto:
      "f(x) = 55x + 1.25x² + 0.0667x³ + 12[(x + 1)ln(x + 1) - x] + 150[e^(0.08x) - 1] + 8.333[1 - cos(0.6x)] - 1000",

    f: function (x) {
      return (
        55 * x +
        1.25 * x * x +
        (0.2 / 3) * x * x * x +
        12 * ((x + 1) * Math.log(x + 1) - x) +
        150 * (Math.exp(0.08 * x) - 1) +
        (5 / 0.6) * (1 - Math.cos(0.6 * x)) -
        1000
      );
    },

    x0: 0,
    x1: 30,

    interpretacion:
      "En crisis critica, el gasto se dispara por panico y escasez. Es el escenario que llega mas rapido al limite."
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
    dibujarGrafica3D(casos[casoActual], ultimoResultado);
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
  document.getElementById("dailyFunction").textContent = caso.diariaTexto;
  document.getElementById("caseFunction").textContent = caso.funcionTexto;
  document.getElementById("caseInterpretation").textContent = caso.interpretacion;

  document.getElementById("inputX0").value = caso.x0;
  document.getElementById("inputX1").value = caso.x1;

  actualizarInterpretacionVariables(nombreCaso);
}

function calcularCasoActual() {
  const caso = casos[casoActual];

  const x0 = parseFloat(document.getElementById("inputX0").value);
  const x1 = parseFloat(document.getElementById("inputX1").value);
  const tolerancia = parseFloat(document.getElementById("inputTol").value);
  const maxIteraciones = parseInt(document.getElementById("inputMax").value);

  const resultado = metodoSecante(caso, x0, x1, tolerancia, maxIteraciones);
  ultimoResultado = resultado;

  mostrarResultado(resultado, caso);
  mostrarTabla(resultado.iteracionesTabla);
  dibujarGrafica3D(caso, resultado);
}

function metodoSecante(caso, x0, x1, tolerancia, maxIteraciones) {
  let anterior = x0;
  let actual = x1;
  let error = Infinity;
  const iteracionesTabla = [];

  if (!Number.isFinite(anterior) || !Number.isFinite(actual)) {
    return crearResultadoError("Los valores iniciales no son validos.", iteracionesTabla, x0, x1);
  }

  if (anterior === actual) {
    return crearResultadoError("x0 y x1 no pueden ser iguales.", iteracionesTabla, x0, x1);
  }

  for (let i = 1; i <= maxIteraciones; i++) {
    const fAnterior = caso.f(anterior);
    const fActual = caso.f(actual);
    const denominador = fActual - fAnterior;

    if (!Number.isFinite(fAnterior) || !Number.isFinite(fActual)) {
      return crearResultadoError("La funcion no esta definida para los valores actuales.", iteracionesTabla, x0, x1);
    }

    if (Math.abs(denominador) < 1e-12) {
      return crearResultadoError("El denominador f(x1)-f(x0) es muy cercano a cero.", iteracionesTabla, x0, x1);
    }

    const nuevo = actual - fActual * (actual - anterior) / denominador;
    error = Math.abs(nuevo - actual);

    iteracionesTabla.push({
      iteracion: i,
      x0: anterior,
      x1: actual,
      fx0: fAnterior,
      fx1: fActual,
      nuevo,
      error
    });

    if (!Number.isFinite(nuevo) || nuevo <= -1) {
      return crearResultadoError("El metodo salto a un valor no valido.", iteracionesTabla, x0, x1);
    }

    if (Math.abs(caso.f(nuevo)) < tolerancia || error < tolerancia) {
      return {
        raiz: nuevo,
        fx: caso.f(nuevo),
        error,
        iteraciones: i,
        convergio: true,
        mensaje: "El metodo convergio correctamente.",
        iteracionesTabla,
        x0,
        x1
      };
    }

    anterior = actual;
    actual = nuevo;
  }

  return {
    raiz: actual,
    fx: caso.f(actual),
    error,
    iteraciones: maxIteraciones,
    convergio: false,
    mensaje: "Se alcanzo el maximo de iteraciones sin cumplir la tolerancia.",
    iteracionesTabla,
    x0,
    x1
  };
}

function crearResultadoError(mensaje, iteracionesTabla, x0, x1) {
  return {
    raiz: NaN,
    fx: NaN,
    error: NaN,
    iteraciones: 0,
    convergio: false,
    mensaje,
    iteracionesTabla,
    x0,
    x1
  };
}

function mostrarResultado(resultado, caso) {
  document.getElementById("resultadoRaiz").textContent = formatoNumero(resultado.raiz);
  document.getElementById("resultadoFx").textContent = formatoCientifico(resultado.fx);
  document.getElementById("resultadoError").textContent = formatoCientifico(resultado.error);
  document.getElementById("resultadoIteraciones").textContent = resultado.iteraciones;

  const convergencia = document.getElementById("resultadoConvergencia");
  convergencia.textContent = resultado.convergio ? "Si" : "No";
  convergencia.className = resultado.convergio ? "ok" : "no";

  const analisis = document.getElementById("analisisResultado");

  if (!resultado.convergio) {
    analisis.textContent =
      resultado.mensaje +
      " Revisa los valores iniciales x0 y x1. Si son malos, la Secante puede fallar.";
    return;
  }

  analisis.textContent =
    resultado.mensaje +
    " Para el " +
    caso.titulo +
    ", la raiz aproximada es x = " +
    resultado.raiz.toFixed(4) +
    " dias. Esto significa que alrededor de ese dia el gasto acumulado alcanza el limite permitido.";
}

function mostrarTabla(iteraciones) {
  const cuerpo = document.getElementById("tablaIteraciones");
  cuerpo.innerHTML = "";

  if (iteraciones.length === 0) {
    cuerpo.innerHTML = `<tr><td colspan="7">No hay iteraciones para mostrar.</td></tr>`;
    return;
  }

  iteraciones.forEach((it) => {
    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td>${it.iteracion}</td>
      <td>${formatoNumero(it.x0)}</td>
      <td>${formatoNumero(it.x1)}</td>
      <td>${formatoCientifico(it.fx0)}</td>
      <td>${formatoCientifico(it.fx1)}</td>
      <td>${formatoNumero(it.nuevo)}</td>
      <td>${formatoCientifico(it.error)}</td>
    `;

    cuerpo.appendChild(fila);
  });
}

function compararCasos() {
  const cuerpo = document.getElementById("tablaComparacionCasos");
  cuerpo.innerHTML = "";

  const nombres = ["ideal", "moderado", "critico"];

  nombres.forEach((nombre) => {
    const caso = casos[nombre];
    const resultado = metodoSecante(caso, caso.x0, caso.x1, 0.000001, 100);

    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td>${caso.titulo}</td>
      <td>${formatoNumero(resultado.raiz)}</td>
      <td>${resultado.iteraciones}</td>
      <td>${formatoCientifico(resultado.error)}</td>
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
        "En el estado ideal se analiza un escenario controlado. Los precios suben lentamente y el gasto acumulado tarda mas en llegar al limite permitido.",
      conclusion:
        "En este caso, la Secante usa dos puntos iniciales para aproximar la pendiente y encontrar el dia critico sin usar derivada."
    },

    moderado: {
      texto:
        "En la crisis moderada el gasto diario aumenta con mayor velocidad. Existen rumores, menor abastecimiento y mayor presion sobre los precios.",
      conclusion:
        "En este caso, la Secante encuentra una raiz menor que en el estado ideal, mostrando que el limite economico se alcanza antes."
    },

    critico: {
      texto:
        "En la crisis critica existe panico de compra, escasez visible, reduccion de stock y aumento acelerado de precios.",
      conclusion:
        "En este caso, la raiz aparece en menos dias. Esto indica que el sistema llega rapidamente al limite permitido y entra antes en una zona critica."
    }
  };

  document.getElementById("variablesCaseTitle").textContent = caso.titulo;
  document.getElementById("variablesCaseText").textContent = datos[nombreCaso].texto;
  document.getElementById("variablesFormula").textContent = caso.funcionTexto;
  document.getElementById("variablesConclusion").textContent = datos[nombreCaso].conclusion;
}

function nivelCrisis(x, raiz) {
  if (!Number.isFinite(raiz)) return 1;
  if (x < raiz * 0.45) return 1;
  if (x < raiz * 0.8) return 2;
  return 3;
}

function dibujarGrafica3D(caso, resultado) {
  const canvas = document.getElementById("secanteGraph");
  const contenedor = canvas.parentElement;

  const ancho = Math.max(contenedor.clientWidth - 32, 320);
  const alto = 430;

  canvas.width = ancho;
  canvas.height = alto;

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, ancho, alto);

  const origenX = ancho * 0.15;
  const origenY = alto * 0.78;

  const escalaX = ancho < 600 ? 14 : 23;
  const escalaY = ancho < 600 ? 0.10 : 0.15;
  const escalaZ = ancho < 600 ? 11 : 17;

  const raiz = resultado && Number.isFinite(resultado.raiz) ? resultado.raiz : null;
  const x0 = resultado && Number.isFinite(resultado.x0) ? resultado.x0 : null;
  const x1 = resultado && Number.isFinite(resultado.x1) ? resultado.x1 : null;

  function punto3D(x, y, z) {
    return {
      x: origenX + x * escalaX + z * escalaZ,
      y: origenY - y * escalaY - z * escalaZ * 0.55
    };
  }

  dibujarPlanoBase(ctx, origenX, origenY, escalaX, escalaZ);
  dibujarEjes(ctx, punto3D, origenX, origenY);
  dibujarCurva(ctx, caso, raiz, punto3D);

  if (x0 !== null) {
    dibujarPuntoInicial(ctx, x0, "x0", "#f59e0b", punto3D, origenY);
  }

  if (x1 !== null) {
    dibujarPuntoInicial(ctx, x1, "x1", "#10b981", punto3D, origenY);
  }

  if (raiz !== null) {
    dibujarPuntoRaiz(ctx, raiz, punto3D, origenY);
  }

  dibujarLeyenda(ctx, caso);
}

function dibujarPlanoBase(ctx, origenX, origenY, escalaX, escalaZ) {
  ctx.fillStyle = "rgba(37, 99, 235, 0.06)";
  ctx.beginPath();
  ctx.moveTo(origenX, origenY);
  ctx.lineTo(origenX + 20 * escalaX, origenY);
  ctx.lineTo(origenX + 20 * escalaX + 5 * escalaZ, origenY - 5 * escalaZ * 0.55);
  ctx.lineTo(origenX + 5 * escalaZ, origenY - 5 * escalaZ * 0.55);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 1;

  for (let i = 0; i <= 20; i += 2) {
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
    const x2 = origenX + 20 * escalaX + z * escalaZ;
    const y2 = origenY - z * escalaZ * 0.55;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}

function dibujarEjes(ctx, punto3D, origenX, origenY) {
  const ejeX = punto3D(20, 0, 0);
  const ejeY = punto3D(0, 1600, 0);
  const ejeZ = punto3D(0, 0, 5);

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
  ctx.fillText("f(x)", ejeY.x - 35, ejeY.y - 10);
  ctx.fillText("nivel", ejeZ.x + 10, ejeZ.y - 8);

  ctx.fillStyle = "#6b7280";
  ctx.font = "12px Segoe UI";

  for (let x = 0; x <= 20; x += 4) {
    const p = punto3D(x, 0, 0);
    ctx.fillText(x.toString(), p.x - 4, p.y + 18);
  }
}

function dibujarCurva(ctx, caso, raiz, punto3D) {
  const puntos = [];

  for (let x = 0; x <= 20; x += 0.12) {
    let y = caso.f(x);

    if (y < -1000) y = -1000;
    if (y > 1600) y = 1600;

    const z = nivelCrisis(x, raiz);
    const punto = punto3D(x, y + 1000, z);

    puntos.push(punto);
  }

  ctx.beginPath();
  ctx.lineWidth = 5;
  ctx.strokeStyle = "#2563eb";

  puntos.forEach((p, index) => {
    if (index === 0) {
      ctx.moveTo(p.x, p.y);
    } else {
      ctx.lineTo(p.x, p.y);
    }
  });

  ctx.stroke();

  ctx.beginPath();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(37, 99, 235, 0.25)";

  puntos.forEach((p, index) => {
    if (index === 0) {
      ctx.moveTo(p.x, p.y + 22);
    } else {
      ctx.lineTo(p.x, p.y + 22);
    }
  });

  ctx.stroke();
}

function dibujarPuntoInicial(ctx, x, etiqueta, color, punto3D, origenY) {
  const punto = punto3D(x, 1000, 2);

  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.setLineDash([6, 6]);
  ctx.lineWidth = 2;
  ctx.moveTo(punto.x, punto.y);
  ctx.lineTo(punto.x, origenY);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.arc(punto.x, punto.y, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.font = "bold 13px Segoe UI";
  ctx.fillText(etiqueta + " = " + x.toFixed(2), punto.x + 10, punto.y - 10);
}

function dibujarPuntoRaiz(ctx, raiz, punto3D, origenY) {
  const puntoRaiz = punto3D(raiz, 1000, 3);

  ctx.beginPath();
  ctx.strokeStyle = "#dc2626";
  ctx.setLineDash([6, 6]);
  ctx.lineWidth = 2;
  ctx.moveTo(puntoRaiz.x, puntoRaiz.y);
  ctx.lineTo(puntoRaiz.x, origenY);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.beginPath();
  ctx.fillStyle = "#dc2626";
  ctx.arc(puntoRaiz.x, puntoRaiz.y, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#dc2626";
  ctx.font = "bold 14px Segoe UI";
  ctx.fillText("Raiz x ≈ " + raiz.toFixed(2), puntoRaiz.x + 12, puntoRaiz.y - 10);
}

function dibujarLeyenda(ctx, caso) {
  ctx.fillStyle = "#111827";
  ctx.font = "bold 14px Segoe UI";
  ctx.fillText("Metodo de la Secante - Grafica 3D aproximada", 20, 30);

  ctx.font = "12px Segoe UI";
  ctx.fillStyle = "#6b7280";
  ctx.fillText("Eje X: dias | Eje Y: f(x) | Eje Z: nivel de crisis", 20, 52);

  ctx.fillStyle = "#2563eb";
  ctx.fillRect(20, 70, 14, 14);
  ctx.fillStyle = "#374151";
  ctx.fillText("Funcion acumulada f(x)", 42, 82);

  ctx.fillStyle = "#f59e0b";
  ctx.beginPath();
  ctx.arc(27, 102, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#374151";
  ctx.fillText("Valor inicial x0", 42, 106);

  ctx.fillStyle = "#10b981";
  ctx.beginPath();
  ctx.arc(27, 126, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#374151";
  ctx.fillText("Valor inicial x1", 42, 130);

  ctx.fillStyle = "#dc2626";
  ctx.beginPath();
  ctx.arc(27, 150, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#374151";
  ctx.fillText("Raiz aproximada", 42, 154);

  ctx.fillStyle = "#111827";
  ctx.font = "bold 12px Segoe UI";
  ctx.fillText(caso.titulo, 20, 178);
}

function formatoNumero(valor) {
  if (!Number.isFinite(valor)) return "No definido";
  return valor.toFixed(6);
}

function formatoCientifico(valor) {
  if (!Number.isFinite(valor)) return "No definido";
  if (Math.abs(valor) < 0.0001) {
    return valor.toExponential(3);
  }
  return valor.toFixed(6);
}