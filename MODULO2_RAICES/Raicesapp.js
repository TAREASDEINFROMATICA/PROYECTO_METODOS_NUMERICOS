const casos = {
  ideal: {
    titulo: "Caso I: Estado ideal",
    descripcion:
      "Situacion controlada. Los precios suben lentamente, no existe panico de compra y el gasto familiar crece de forma moderada.",

    diariaTexto:
      "C(x) = 35 + 0.8x + 4ln(x + 1) + 1.5sen(0.3x)",

    funcionTexto:
      "f(x) = 35x + 0.4x² + 4[(x + 1)ln(x + 1) - x] + 5[1 - cos(0.3x)] - 700",

    derivadaTexto:
      "f'(x) = C(x) = 35 + 0.8x + 4ln(x + 1) + 1.5sen(0.3x)",

    f: function (x) {
      return (
        35 * x +
        0.4 * x * x +
        4 * ((x + 1) * Math.log(x + 1) - x) +
        5 * (1 - Math.cos(0.3 * x)) -
        700
      );
    },

    justificacion:
      "En el estado ideal se usan valores bajos porque el sistema todavia esta controlado. El costo diario base es 35 Bs, el aumento lineal es pequeño y el efecto de rumores crece lentamente mediante logaritmo.",

    numeros: {
      base: ["35", "Costo diario base controlado."],
      lineal: ["0.8x", "Aumento diario bajo."],
      aceleracion: ["No tiene x² diario", "No existe aceleracion fuerte."],
      log: ["4ln(x+1)", "Rumor bajo y crecimiento lento."],
      exp: ["No tiene exponencial", "No hay panico de compra."],
      sin: ["1.5sen(0.3x)", "Variacion pequeña por dias de mayor compra."],
      limite: ["L = 700", "Limite familiar permitido."]
    },

    conclusion:
      "El punto critico aparece cerca del dia 14.32. Esto significa que el sistema resiste mas tiempo antes de llegar al limite.",

    interpretacion:
      "En el estado ideal, el gasto crece de manera controlada. Por eso el limite se alcanza mas tarde."
  },

  moderado: {
    titulo: "Caso II: Crisis moderada",
    descripcion:
      "Situacion intermedia. Los precios aumentan con mayor velocidad, la reserva empieza a disminuir y la familia se acerca mas rapido a su limite economico.",

    diariaTexto:
      "C(x) = 45 + 1.6x + 8ln(x + 1) + 5e^(0.05x) + 3sen(0.5x)",

    funcionTexto:
      "f(x) = 45x + 0.8x² + 8[(x + 1)ln(x + 1) - x] + 100[e^(0.05x) - 1] + 6[1 - cos(0.5x)] - 900",

    derivadaTexto:
      "f'(x) = C(x) = 45 + 1.6x + 8ln(x + 1) + 5e^(0.05x) + 3sen(0.5x)",

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

    justificacion:
      "En la crisis moderada aumentan los valores porque ya existe presion sobre el mercado. Aparece una parte exponencial que representa el inicio del panico o de la escasez.",

    numeros: {
      base: ["45", "Costo diario base mayor."],
      lineal: ["1.6x", "Aumento diario medio."],
      aceleracion: ["0.8x² acumulado", "Resultado de integrar el aumento lineal diario."],
      log: ["8ln(x+1)", "Rumores con mayor impacto."],
      exp: ["5e^(0.05x)", "Inicio de panico o escasez."],
      sin: ["3sen(0.5x)", "Variacion por dias de mayor demanda."],
      limite: ["L = 900", "Limite economico mas exigido."]
    },

    conclusion:
      "El punto critico aparece cerca del dia 11.91. La crisis llega antes que en el estado ideal.",

    interpretacion:
      "En crisis moderada, el gasto sube mas rapido por mayor demanda y rumores."
  },

  critico: {
    titulo: "Caso III: Crisis critica",
    descripcion:
      "Crisis fuerte. Existe panico de compra, reduccion de stock, incremento artificial de demanda y aumento rapido de precios.",

    diariaTexto:
      "C(x) = 55 + 2.5x + 0.2x² + 12ln(x + 1) + 12e^(0.08x) + 5sen(0.6x)",

    funcionTexto:
      "f(x) = 55x + 1.25x² + 0.0667x³ + 12[(x + 1)ln(x + 1) - x] + 150[e^(0.08x) - 1] + 8.333[1 - cos(0.6x)] - 1000",

    derivadaTexto:
      "f'(x) = C(x) = 55 + 2.5x + 0.2x² + 12ln(x + 1) + 12e^(0.08x) + 5sen(0.6x)",

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

    justificacion:
      "En la crisis critica se usan valores altos porque el sistema esta sometido a mayor presion. El costo base es elevado, aparece crecimiento cuadratico diario y la exponencial representa panico de compra.",

    numeros: {
      base: ["55", "Costo diario base elevado."],
      lineal: ["2.5x", "Aumento diario fuerte."],
      aceleracion: ["0.2x² diario", "Aceleracion por panico y escasez."],
      log: ["12ln(x+1)", "Rumores acumulados con mayor impacto."],
      exp: ["12e^(0.08x)", "Panico de compra y escasez visible."],
      sin: ["5sen(0.6x)", "Variaciones fuertes por bloqueos o compras masivas."],
      limite: ["L = 1000", "Limite maximo tolerable."]
    },

    conclusion:
      "El punto critico aparece cerca del dia 9.18. Es el escenario mas peligroso porque llega al limite en menos tiempo.",

    interpretacion:
      "En crisis critica, el gasto se dispara por panico, escasez y aumento acelerado de precios."
  }
};

let casoActual = "ideal";

document.addEventListener("DOMContentLoaded", () => {
  configurarBotones();
  actualizarCaso("ideal");
  configurarComparativa();

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

      const caso = boton.getAttribute("data-case");
      actualizarCaso(caso);
    });
  });
}

function actualizarCaso(nombreCaso) {
  casoActual = nombreCaso;
  const caso = casos[nombreCaso];
  const raiz = calcularRaizBiseccion(caso, 0, 30, 0.000001, 100);

  document.getElementById("caseTitle").textContent = caso.titulo;
  document.getElementById("caseDescription").textContent = caso.descripcion;
  document.getElementById("dailyFunction").textContent = caso.diariaTexto;
  document.getElementById("caseFunction").textContent = caso.funcionTexto;
  document.getElementById("caseDerivative").textContent = caso.derivadaTexto;

  document.getElementById("approxRoot").textContent =
    "x ≈ " + raiz.toFixed(2) + " dias";

  document.getElementById("rootInterpretation").textContent =
    caso.interpretacion +
    " Para este modelo, el punto critico se aproxima al dia " +
    raiz.toFixed(2) +
    ".";

  document.getElementById("justificationText").textContent = caso.justificacion;

  document.getElementById("valueBase").textContent = caso.numeros.base[0];
  document.getElementById("textBase").textContent = caso.numeros.base[1];

  document.getElementById("valueLineal").textContent = caso.numeros.lineal[0];
  document.getElementById("textLineal").textContent = caso.numeros.lineal[1];

  document.getElementById("valueAceleracion").textContent = caso.numeros.aceleracion[0];
  document.getElementById("textAceleracion").textContent = caso.numeros.aceleracion[1];

  document.getElementById("valueLog").textContent = caso.numeros.log[0];
  document.getElementById("textLog").textContent = caso.numeros.log[1];

  document.getElementById("valueExp").textContent = caso.numeros.exp[0];
  document.getElementById("textExp").textContent = caso.numeros.exp[1];

  document.getElementById("valueSin").textContent = caso.numeros.sin[0];
  document.getElementById("textSin").textContent = caso.numeros.sin[1];

  document.getElementById("valueLimit").textContent = caso.numeros.limite[0];
  document.getElementById("textLimit").textContent = caso.numeros.limite[1];

  document.getElementById("caseConclusion").textContent = caso.conclusion;

  dibujarGrafica3D(caso);
}

function calcularRaizBiseccion(caso, a, b, tolerancia, maxIteraciones) {
  let fa = caso.f(a);
  let fb = caso.f(b);

  if (fa * fb > 0) {
    return NaN;
  }

  let medio = a;

  for (let i = 0; i < maxIteraciones; i++) {
    medio = (a + b) / 2;
    const fm = caso.f(medio);

    if (Math.abs(fm) < tolerancia) {
      return medio;
    }

    if (fa * fm < 0) {
      b = medio;
      fb = fm;
    } else {
      a = medio;
      fa = fm;
    }
  }

  return medio;
}

function nivelCrisis(x, raiz) {
  if (x < raiz * 0.45) return 1;
  if (x < raiz * 0.80) return 2;
  return 3;
}

function dibujarGrafica3D(caso) {
  const canvas = document.getElementById("rootGraph");
  const contenedor = canvas.parentElement;

  const ancho = Math.max(contenedor.clientWidth - 32, 320);
  const alto = 420;

  canvas.width = ancho;
  canvas.height = alto;

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, ancho, alto);

  const origenX = ancho * 0.16;
  const origenY = alto * 0.78;

  const escalaX = ancho < 600 ? 14 : 23;
  const escalaY = ancho < 600 ? 0.10 : 0.15;
  const escalaZ = ancho < 600 ? 11 : 17;

  const raiz = calcularRaizBiseccion(caso, 0, 30, 0.000001, 100);

  function punto3D(x, y, z) {
    return {
      x: origenX + x * escalaX + z * escalaZ,
      y: origenY - y * escalaY - z * escalaZ * 0.55
    };
  }

  dibujarPlanoBase(ctx, origenX, origenY, escalaX, escalaZ);
  dibujarEjes(ctx, punto3D, origenX, origenY);
  dibujarCurva(ctx, caso, raiz, punto3D);
  dibujarPuntoRaiz(ctx, raiz, punto3D, origenY);
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
  ctx.fillText("nivel de crisis", ejeZ.x + 10, ejeZ.y - 8);

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

    puntos.push({
      xCanvas: punto.x,
      yCanvas: punto.y
    });
  }

  ctx.beginPath();
  ctx.lineWidth = 5;
  ctx.strokeStyle = "#2563eb";

  puntos.forEach((p, index) => {
    if (index === 0) {
      ctx.moveTo(p.xCanvas, p.yCanvas);
    } else {
      ctx.lineTo(p.xCanvas, p.yCanvas);
    }
  });

  ctx.stroke();

  ctx.beginPath();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(37, 99, 235, 0.25)";

  puntos.forEach((p, index) => {
    const sombraY = p.yCanvas + 22;

    if (index === 0) {
      ctx.moveTo(p.xCanvas, sombraY);
    } else {
      ctx.lineTo(p.xCanvas, sombraY);
    }
  });

  ctx.stroke();
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
  ctx.fillText("Grafica 3D aproximada del punto critico", 20, 30);

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
  ctx.fillText("Raiz donde f(x)=0", 42, 106);

  ctx.fillStyle = "#111827";
  ctx.font = "bold 12px Segoe UI";
  ctx.fillText(caso.titulo, 20, 132);
}
function configurarComparativa() {
  const select = document.getElementById("comparisonCase");
  const boton = document.getElementById("btnCompararMetodos");

  if (!select || !boton) return;

  boton.addEventListener("click", () => {
    compararMetodos(select.value);
  });

  select.addEventListener("change", () => {
    compararMetodos(select.value);
  });

  compararMetodos("critico");
}

function compararMetodos(nombreCaso) {
  const caso = casos[nombreCaso];

  const resultadoBiseccion = metodoBiseccion(caso, 0, 30, 0.000001, 100);
  const resultadoNewton = metodoNewton(caso, 10, 0.000001, 100);
  const resultadoSecante = metodoSecante(caso, 0, 30, 0.000001, 100);

  const resultados = [
    {
      metodo: "Biseccion",
      ...resultadoBiseccion
    },
    {
      metodo: "Newton-Raphson",
      ...resultadoNewton
    },
    {
      metodo: "Secante",
      ...resultadoSecante
    }
  ];

  const cuerpoTabla = document.getElementById("tablaComparacionMetodos");
  cuerpoTabla.innerHTML = "";

  resultados.forEach((r) => {
    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td>${r.metodo}</td>
      <td>${r.iteraciones}</td>
      <td>${r.convergio ? '<span class="ok">✔</span>' : '<span class="no">✖</span>'}</td>
      <td>${formatoNumero(r.raiz)}</td>
      <td>${formatoCientifico(r.fx)}</td>
      <td>${formatoCientifico(r.error)}</td>
    `;

    cuerpoTabla.appendChild(fila);
  });

  mostrarResumenComparacion(nombreCaso, resultados);
}

function metodoBiseccion(caso, a, b, tolerancia, maxIteraciones) {
  let fa = caso.f(a);
  let fb = caso.f(b);

  if (fa * fb > 0) {
    return {
      raiz: NaN,
      fx: NaN,
      error: NaN,
      iteraciones: 0,
      convergio: false
    };
  }

  let medio = a;
  let error = Math.abs(b - a);

  for (let i = 1; i <= maxIteraciones; i++) {
    medio = (a + b) / 2;
    const fm = caso.f(medio);
    error = Math.abs(b - a) / 2;

    if (Math.abs(fm) < tolerancia || error < tolerancia) {
      return {
        raiz: medio,
        fx: fm,
        error: error,
        iteraciones: i,
        convergio: true
      };
    }

    if (fa * fm < 0) {
      b = medio;
      fb = fm;
    } else {
      a = medio;
      fa = fm;
    }
  }

  return {
    raiz: medio,
    fx: caso.f(medio),
    error: error,
    iteraciones: maxIteraciones,
    convergio: false
  };
}

function metodoNewton(caso, x0, tolerancia, maxIteraciones) {
  let xActual = x0;
  let error = Infinity;

  for (let i = 1; i <= maxIteraciones; i++) {
    const fx = caso.f(xActual);
    const dfx = derivadaNumerica(caso, xActual);

    if (Math.abs(dfx) < 1e-12) {
      return {
        raiz: xActual,
        fx: fx,
        error: error,
        iteraciones: i,
        convergio: false
      };
    }

    const xNuevo = xActual - fx / dfx;
    error = Math.abs(xNuevo - xActual);

    if (Math.abs(caso.f(xNuevo)) < tolerancia || error < tolerancia) {
      return {
        raiz: xNuevo,
        fx: caso.f(xNuevo),
        error: error,
        iteraciones: i,
        convergio: true
      };
    }

    xActual = xNuevo;
  }

  return {
    raiz: xActual,
    fx: caso.f(xActual),
    error: error,
    iteraciones: maxIteraciones,
    convergio: false
  };
}

function metodoSecante(caso, x0, x1, tolerancia, maxIteraciones) {
  let anterior = x0;
  let actual = x1;
  let error = Infinity;

  for (let i = 1; i <= maxIteraciones; i++) {
    const fAnterior = caso.f(anterior);
    const fActual = caso.f(actual);

    const denominador = fActual - fAnterior;

    if (Math.abs(denominador) < 1e-12) {
      return {
        raiz: actual,
        fx: fActual,
        error: error,
        iteraciones: i,
        convergio: false
      };
    }

    const nuevo = actual - fActual * (actual - anterior) / denominador;
    error = Math.abs(nuevo - actual);

    if (Math.abs(caso.f(nuevo)) < tolerancia || error < tolerancia) {
      return {
        raiz: nuevo,
        fx: caso.f(nuevo),
        error: error,
        iteraciones: i,
        convergio: true
      };
    }

    anterior = actual;
    actual = nuevo;
  }

  return {
    raiz: actual,
    fx: caso.f(actual),
    error: error,
    iteraciones: maxIteraciones,
    convergio: false
  };
}

function derivadaNumerica(caso, x) {
  const h = 0.00001;
  return (caso.f(x + h) - caso.f(x - h)) / (2 * h);
}

function mostrarResumenComparacion(nombreCaso, resultados) {
  const resumen = document.getElementById("comparisonSummary");

  const caso = casos[nombreCaso];
  const convergentes = resultados.filter((r) => r.convergio);

  if (convergentes.length === 0) {
    resumen.textContent =
      "Ningun metodo logro converger con los datos actuales. Se deben revisar los valores iniciales o el intervalo.";
    return;
  }

  const masRapido = convergentes.reduce((mejor, actual) => {
    return actual.iteraciones < mejor.iteraciones ? actual : mejor;
  });

  const raizPromedio =
    convergentes.reduce((suma, r) => suma + r.raiz, 0) / convergentes.length;

  resumen.textContent =
    "Escenario seleccionado: " +
    caso.titulo +
    ". Los metodos convergentes encontraron un punto critico aproximado en x = " +
    raizPromedio.toFixed(4) +
    " dias. El metodo mas rapido fue " +
    masRapido.metodo +
    " con " +
    masRapido.iteraciones +
    " iteraciones.";
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