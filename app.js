// GLOBAL STATE
let anim = null;
let t = 0;

let pressing = false;
let squeeze = 0;
let velocity = 0;

// global button trigger
window.startAnim = function(type) {
  anim = type;
  t = 0;
};

// MAIN
window.addEventListener("DOMContentLoaded", () => {

  const anchor = document.querySelector("#anchor");
  const wrap = document.querySelector("#animWrap");
  const ball = document.querySelector("#ball");
  const ui = document.querySelector("#ui");
  const hint = document.querySelector("#hint");

  if (!anchor || !wrap) {
    console.error("Missing anchor/animWrap in DOM");
    return;
  }

  // Show / hide UI + hint when tracking changes
  anchor.addEventListener("targetFound", () => {
    ui.style.display = "flex";
    hint.style.opacity = "1";
  });

  anchor.addEventListener("targetLost", () => {
    ui.style.display = "none";
    hint.style.opacity = "0";
    anim = null;
  });

  // GLOBAL TOUCH / MOUSE handlers
  // Ignore touches that start inside the UI (so button taps don't trigger squeeze)
  window.addEventListener("touchstart", (e) => {
    if (e.target && e.target.closest && e.target.closest("#ui")) {
      // started inside UI → ignore for squeeze
      return;
    }
    pressing = true;
    // hide hint on first touch
    hint.style.opacity = "0";
  }, { passive: true });

  window.addEventListener("touchend", () => {
    pressing = false;
  }, { passive: true });

  window.addEventListener("mousedown", (e) => {
    if (e.target && e.target.closest && e.target.closest("#ui")) return;
    pressing = true;
    hint.style.opacity = "0";
  });

  window.addEventListener("mouseup", () => {
    pressing = false;
  });

  // OPTIONAL: ensure model loaded before attaching anything to it (not strictly needed here)
  ball.addEventListener("model-loaded", () => {
    // nothing required now, but this ensures model is ready
  });

  // Animation controller — attached to animWrap
  AFRAME.registerComponent("anim-controller", {

    tick() {
      if (!wrap.object3D) return;

      const o = wrap.object3D;

      // ---- SQUEEZE (scale only) ----
      // spring parameters (tune to taste)
      const stiffness = 0.12;   // responsiveness
      const damping = 0.85;     // damping (0..1)

      const target = pressing ? 1 : 0;

      velocity += (target - squeeze) * stiffness;
      velocity *= damping;
      squeeze += velocity;

      const squash = 1 - squeeze * 0.5;
      const stretch = 1 + squeeze * 0.6;

      // apply scale (local)
      o.scale.set(stretch, squash, stretch);

      // reset motion layers (so layers don't accumulate)
      // We only set defaults here; animations will override temporarily.
      o.position.y = 0;
      o.rotation.z = 0;

      // ---- BUTTON ANIMATIONS (non-scale properties only) ----
      t += 0.05;

      switch (anim) {
        case "bounce": {
          const progress = Math.min(t / 1.6, 1);
          const bounce = Math.abs(Math.exp(-4 * progress) * Math.cos(12 * progress));
          o.position.y = bounce * 0.4;
          if (progress >= 1) {
            anim = null;
          }
          break;
        }

        case "jiggle": {
          o.rotation.z = Math.sin(t * 12) * 0.15;
          if (t > Math.PI) {
            o.rotation.z = 0;
            anim = null;
          }
          break;
        }
      }
    }

  });

  // attach controller to the wrapper
  wrap.setAttribute("anim-controller", "");

});
