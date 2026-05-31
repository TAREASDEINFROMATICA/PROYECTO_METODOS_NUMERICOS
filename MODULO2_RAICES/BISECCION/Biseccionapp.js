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

    intervalo: [0, 30],

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

    intervalo: [0, 30],

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

    intervalo: [0, 30],

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

  document.getElementById("inputA").value = caso.intervalo[0];
  document.getElementById("inputB").value = caso.intervalo[1];
    actualizarInterpretacionVariables(nombreCaso);
}

function calcularCasoActual() {
  const caso = casos[casoActual];

  const a = parseFloat(document.getElementById("inputA").value);
  const b = parseFloat(document.getElementById("inputB").value);
  const tolerancia = parseFloat(document.getElementById("inputTol").value);
  const maxIteraciones = parseInt(document.getElementById("inputMax").value);

  const resultado = metodoBiseccion(caso, a, b, tolerancia, maxIteraciones);
  ultimoResultado = resultado;

  mostrarResultado(resultado, caso);
  mostrarTabla(resultado.iteracionesTabla);
  dibujarGrafica3D(caso, resultado);
}

function metodoBiseccion(caso, aInicial, bInicial, tolerancia, maxIteraciones) {
  let a = aInicial;
  let b = bInicial;
  let fa = caso.f(a);
  let fb = caso.f(b);
  const iteracionesTabla = [];

  if (!Number.isFinite(fa) || !Number.isFinite(fb)) {
    return crearResultadoError("Los valores iniciales no son validos.", iteracionesTabla);
  }

  if (fa * fb > 0) {
    return crearResultadoError("No hay cambio de signo en el intervalo.", iteracionesTabla);
  }

  let m = a;
  let fm = caso.f(m);
  let error = Math.abs(b - a);

  for (let i = 1; i <= maxIteraciones; i++) {
    m = (a + b) / 2;
    fm = caso.f(m);
    error = Math.abs(b - a) / 2;

    iteracionesTabla.push({
      iteracion: i,
      a,
      b,
      m,
      fa,
      fm,
      error
    });

    if (Math.abs(fm) < tolerancia || error < tolerancia) {
      return {
        raiz: m,
        fx: fm,
        error,
        iteraciones: i,
        convergio: true,
        mensaje: "El metodo convergio correctamente.",
        iteracionesTabla,
        aInicial,
        bInicial
      };
    }

    if (fa * fm < 0) {
      b = m;
      fb = fm;
    } else {
      a = m;
      fa = fm;
    }
  }

  return {
    raiz: m,
    fx: fm,
    error,
    iteraciones: maxIteraciones,
    convergio: false,
    mensaje: "Se alcanzo el maximo de iteraciones sin cumplir la tolerancia.",
    iteracionesTabla,
    aInicial,
    bInicial
  };
}

function crearResultadoError(mensaje, iteracionesTabla) {
  return {
    raiz: NaN,
    fx: NaN,
    error: NaN,
    iteraciones: 0,
    convergio: false,
    mensaje,
    iteracionesTabla,
    aInicial: NaN,
    bInicial: NaN
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
      " Revisa que el intervalo tenga cambio de signo, es decir, f(a) y f(b) deben tener signos opuestos.";
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
      <td>${formatoNumero(it.a)}</td>
      <td>${formatoNumero(it.b)}</td>
      <td>${formatoNumero(it.m)}</td>
      <td>${formatoCientifico(it.fa)}</td>
      <td>${formatoCientifico(it.fm)}</td>
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
    const resultado = metodoBiseccion(caso, 0, 30, 0.000001, 100);

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

function nivelCrisis(x, raiz) {
  if (!Number.isFinite(raiz)) return 1;
  if (x < raiz * 0.45) return 1;
  if (x < raiz * 0.8) return 2;
  return 3;
}

function dibujarGrafica3D(caso, resultado) {
  const canvas = document.getElementById("bisectionGraph");
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

  function punto3D(x, y, z) {
    return {
      x: origenX + x * escalaX + z * escalaZ,
      y: origenY - y * escalaY - z * escalaZ * 0.55
    };
  }

  dibujarPlanoBase(ctx, origenX, origenY, escalaX, escalaZ);
  dibujarEjes(ctx, punto3D, origenX, origenY);
  dibujarCurva(ctx, caso, raiz, punto3D);

  if (resultado && Number.isFinite(resultado.aInicial) && Number.isFinite(resultado.bInicial)) {
    dibujarIntervalo(ctx, resultado.aInicial, resultado.bInicial, punto3D, origenY);
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

function dibujarIntervalo(ctx, a, b, punto3D, origenY) {
  const pa = punto3D(a, 1000, 2);
  const pb = punto3D(b, 1000, 2);

  ctx.setLineDash([6, 6]);
  ctx.lineWidth = 2;

  ctx.strokeStyle = "#f59e0b";
  ctx.beginPath();
  ctx.moveTo(pa.x, pa.y);
  ctx.lineTo(pa.x, origenY);
  ctx.stroke();

  ctx.strokeStyle = "#10b981";
  ctx.beginPath();
  ctx.moveTo(pb.x, pb.y);
  ctx.lineTo(pb.x, origenY);
  ctx.stroke();

  ctx.setLineDash([]);

  ctx.fillStyle = "#92400e";
  ctx.font = "bold 12px Segoe UI";
  ctx.fillText("a", pa.x - 8, origenY + 34);

  ctx.fillStyle = "#047857";
  ctx.fillText("b", pb.x - 8, origenY + 34);
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
  ctx.fillText("Metodo de Biseccion - Grafica 3D aproximada", 20, 30);

  ctx.font = "12px Segoe UI";
  ctx.fillStyle = "#6b7280";
  ctx.fillText("Eje X: dias | Eje Y: f(x) | Eje Z: nivel de crisis", 20, 52);

  ctx.fillStyle = "#2563eb";
  ctx.fillRect(20, 70, 14, 14);
  ctx.fillStyle = "#374151";
  ctx.fillText("Funcion acumulada f(x)", 42, 82);

  ctx.fillStyle = "#dc2626";
  ctx.beginPath();
  ctx.arc(27, 102, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#374151";
  ctx.fillText("Raiz aproximada", 42, 106);

  ctx.fillStyle = "#111827";
  ctx.font = "bold 12px Segoe UI";
  ctx.fillText(caso.titulo, 20, 132);
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
function actualizarInterpretacionVariables(nombreCaso) {
  const caso = casos[nombreCaso];

  const datos = {
    ideal: {
      texto:
        "En el estado ideal se analiza un escenario controlado. Los precios suben lentamente y el gasto acumulado tarda mas en llegar al limite permitido.",
      conclusion:
        "En este caso, si la raiz aparece en un dia mayor, significa que la familia tiene mas tiempo antes de llegar al punto critico. El metodo de Biseccion permite ubicar ese dia reduciendo poco a poco el intervalo."
    },

    moderado: {
      texto:
        "En la crisis moderada el gasto diario aumenta con mayor velocidad. Existen rumores, menor abastecimiento y mayor presion sobre los precios.",
      conclusion:
        "En este caso, la raiz aparece antes que en el estado ideal. Esto significa que el limite economico se alcanza mas rapido y el sistema empieza a perder estabilidad."
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