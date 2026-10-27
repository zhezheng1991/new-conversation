export default async function install(app) {
  const mount = app.getMount("fell-ramp-controls");
  const layer = app.layers[app.config.layerId];
  app.assert(layer, "Lake District Fells is not on the map.");
  await layer.load();

  const ramps = {
    "blue-white-red": { label: "Blue – white – red", colors: ["#2166ac", "#f7f7f7", "#b2182b"] },
    "deep-blue-red": { label: "Deep blue – red", colors: ["#08306b", "#fee0d2", "#cb181d"] },
    "sky-blue-red": { label: "Sky blue – red", colors: ["#4292c6", "#f7f7f7", "#de2d26"] }
  };

  const style = document.createElement("style");
  style.textContent = ".ramp-control{display:grid;gap:12px}.ramp-note{font-size:13px;color:var(--app-text-muted)}.ramp-samples{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.ramp-sample{border:1px solid var(--app-border);border-radius:var(--app-radius);padding:7px;background:var(--app-surface-raised);cursor:pointer;text-align:left}.ramp-swatch{height:18px;border-radius:4px;border:1px solid rgba(0,0,0,.18);margin-bottom:5px}.ramp-label{font-size:11px;color:var(--app-text-muted);line-height:1.2}.ramp-sample[aria-pressed=\"true\"]{outline:2px solid var(--app-accent);outline-offset:1px}";
  const wrap = document.createElement("div");
  wrap.className = "ramp-control";
  const note = document.createElement("div");
  note.className = "ramp-note";
  note.textContent = "Triangle size represents height; colour represents prominence.";
  const select = document.createElement("calcite-select");
  select.label = "Prominence color ramp";
  select.setAttribute("label", "Prominence color ramp");
  Object.entries(ramps).forEach(([id, ramp]) => {
    const option = document.createElement("calcite-option");
    option.value = id;
    option.textContent = ramp.label;
    select.append(option);
  });
  select.value = "blue-white-red";
  const samples = document.createElement("div");
  samples.className = "ramp-samples";

  const applyRamp = (id) => {
    const ramp = ramps[id];
    const [low, mid, high] = ramp.colors;
    layer.renderer = {
      type: "simple",
      symbol: { type: "simple-marker", style: "triangle", color: low, size: 8, outline: { color: "#1f2937", width: 0.7 } },
      visualVariables: [
        { type: "size", field: app.config.heightField, legendOptions: { title: "Height (m)" }, stops: [ { value: app.config.heightMin, size: 6, label: `${app.config.heightMin} m` }, { value: app.config.heightMax, size: 30, label: `${app.config.heightMax} m` } ] },
        { type: "color", field: app.config.prominenceField, legendOptions: { title: "Prominence (m)" }, stops: [ { value: app.config.prominenceMin, color: low, label: `Low (${app.config.prominenceMin} m)` }, { value: (app.config.prominenceMin + app.config.prominenceMax) / 2, color: mid, label: "Mid" }, { value: app.config.prominenceMax, color: high, label: `High (${app.config.prominenceMax} m)` } ] }
      ]
    };
    select.value = id;
    [...samples.children].forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.ramp === id)));
  };

  Object.entries(ramps).forEach(([id, ramp]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "ramp-sample";
    button.dataset.ramp = id;
    button.setAttribute("aria-label", `Apply ${ramp.label} prominence ramp`);
    button.setAttribute("aria-pressed", String(id === "blue-white-red"));
    const swatch = document.createElement("div");
    swatch.className = "ramp-swatch";
    swatch.style.background = `linear-gradient(90deg, ${ramp.colors.join(", ")})`;
    const label = document.createElement("div");
    label.className = "ramp-label";
    label.textContent = ramp.label;
    button.append(swatch, label);
    button.addEventListener("click", () => applyRamp(id));
    samples.append(button);
  });
  select.addEventListener("calciteSelectChange", (event) => applyRamp(event.target.value));
  wrap.append(note, select, samples);
  mount.replaceChildren(style, wrap);
  app.onCleanup(() => mount.replaceChildren());
}