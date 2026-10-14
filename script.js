document.documentElement.classList.add("js");

/* =====================================================
   DATOS DE LA FIESTA: cambiá solo esta parte
   ===================================================== */
const CONFIG = {
  nombre: "Albanys",
  edad: 9,
  ciudad: "Avellaneda, Buenos Aires · Argentina",
  inicio: "2027-04-19T16:30:00-03:00",   // fecha y hora de inicio (con zona horaria)
  fin:    "2027-04-19T19:30:00-03:00",   // fecha y hora de fin
  lugar: "Mi Casa",
  direccion: "Llorente 528, Buenos Aires",
  mapa: "https://www.google.com/maps/search/?api=1&query=Llorente+528+Buenos+Aires",
  whatsapp: "5491121825254",              // con código de país, sin + ni espacios
  limite: "15 de Abril",
  zona: "America/Argentina/Buenos_Aires"
};

/* Casas del sombrero (inventadas, podés cambiarlas) */
const CASAS = [
  { nombre: "Slytherin",  texto: "Fundada por Salazar Slytherin. Valora la ambición, la astucia, la determinación y el ingenio. Sus colores son el verde y el plateado, se identifican por el agua y la serpiente. Entre sus miembros más célebres se encuentran Severus Snape, Draco Malfoy y Tom Riddle (Lord Voldemort).", color: "#1f5a3a" },
  { nombre: "Ravenclaw",   texto: "Fundada por Rowena Ravenclaw. Valora la sabiduría, el aprendizaje, la inteligencia y la creatividad. Sus colores son el azul y el bronce (o plateado en las películas), se identifican por aire y el águila. Miembros reconocidos incluyen a Luna Lovegood y Cho Chang.",   color: "#1f3f8a" },
  { nombre: "Hufflepuff", texto: "Fundada por Helga Hufflepuff. Valora la lealtad, la honestidad, el trabajo duro, la paciencia y la justicia. Sus colores son el amarillo y el negro, se identifican por la tierra y el tejón. Magos notables de esta casa incluyen a Newt Scamander, Cedric Diggory y Nymphadora Tonks.", color: "#b8862b" },
  { nombre: "Gryffindor",    texto: "Fundada por Godric Gryffindor. Valora el coraje, la valentía, la audacia y la caballerosidad. Sus colores emblemáticos son el escarlata y el oro, se identifican por el fuego y el león. Entre sus miembros más famosos destacan Harry Potter, Hermione Granger, Ron Weasley y Albus Dumbledore.",     color: "#8a1c2c" }
];

document.addEventListener("DOMContentLoaded", function () {
  const ini = new Date(CONFIG.inicio), fin = new Date(CONFIG.fin);
  const f = (d, o) => new Intl.DateTimeFormat("es-AR", Object.assign({ timeZone: CONFIG.zona }, o)).format(d);
  const hora = d => f(d, { hour: "2-digit", minute: "2-digit", hour12: false });
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

  /* ---- rellenar textos ---- */
  const datos = {
    nombre: CONFIG.nombre, edad: CONFIG.edad, ciudad: CONFIG.ciudad,
    lugar: CONFIG.lugar, direccion: CONFIG.direccion, limite: CONFIG.limite,
    diaSemana: cap(f(ini, { weekday: "long" })),
    dia: f(ini, { day: "numeric" }), mes: f(ini, { month: "long" }),
    fechaLarga: f(ini, { weekday: "long", day: "numeric", month: "long" }),
    horaInicio: hora(ini) + " h",
    horario: "de " + hora(ini) + " a " + hora(fin) + " h"
  };
  document.querySelectorAll("[data-bind]").forEach(el => { el.textContent = datos[el.dataset.bind] || ""; });

  /* ---- enlaces ---- */
  document.getElementById("btn-mapa").href = CONFIG.mapa;
  const msg = "¡Hola! Confirmo mi asistencia al cumple de " + CONFIG.nombre + ".";
  document.getElementById("btn-wa").href = "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(msg);

  /* ---- abrir la carta ---- */
  const musica = document.getElementById("musica"), sonido = document.getElementById("sonido");
  document.getElementById("sello").addEventListener("click", function () {
    musica.play().catch(() => {});
    document.getElementById("intro").classList.add("fuera");
    document.getElementById("main").hidden = false;
    sonido.hidden = false;
    document.body.classList.remove("bloqueado");
    window.scrollTo(0, 0);
    iniciarReveal();
  });
  sonido.addEventListener("click", function () {
    if (musica.paused) { musica.play(); sonido.classList.remove("off"); }
    else { musica.pause(); sonido.classList.add("off"); }
  });

  /* ---- aparecer al hacer scroll ---- */
  function iniciarReveal() {
    const els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) { els.forEach(e => e.classList.add("in")); return; }
    const obs = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("in"); obs.unobserve(e.target); }
    }), { threshold: 0.12 });
    els.forEach(e => obs.observe(e));
  }

  /* ---- cuenta regresiva ---- */
  const faltan = document.getElementById("faltan");
  function contar() {
    const d = ini - Date.now();
    if (d <= 0) { faltan.textContent = "¡La fiesta ya comenzó!"; return; }
    const dias = Math.floor(d / 864e5), hs = Math.floor(d % 864e5 / 36e5), mn = Math.floor(d % 36e5 / 6e4);
    faltan.textContent = "Faltan " + dias + " días, " + hs + " h y " + mn + " min";
  }
  contar(); setInterval(contar, 30000);

  /* ---- agendar (descarga un archivo .ics) ---- */
  document.getElementById("btn-agenda").addEventListener("click", function () {
    const z = d => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "BEGIN:VEVENT",
      "DTSTART:" + z(ini), "DTEND:" + z(fin),
      "SUMMARY:Cumple mágico de " + CONFIG.nombre,
      "LOCATION:" + CONFIG.lugar + ", " + CONFIG.direccion,
      "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    a.download = "cumple-" + CONFIG.nombre.toLowerCase() + ".ics";
    a.click();
  });

  /* ---- sombrero seleccionador ---- */
  const btnS = document.getElementById("btn-sombrero"), casa = document.getElementById("casa");
  btnS.addEventListener("click", function () {
    btnS.disabled = true; casa.hidden = true;
    btnS.textContent = "Mmm… difícil, muy difícil…";
    setTimeout(function () {
      const c = CASAS[Math.floor(Math.random() * CASAS.length)];
      casa.style.background = c.color;
      casa.innerHTML = "<b>¡" + c.nombre + "!</b>" + c.texto;
      casa.hidden = false;
      btnS.disabled = false; btnS.textContent = "Probar de nuevo";
    }, 2200);
  });
});
