let anim = null;
let t = 0;

let pressing = false;
let squeeze = 0;
let velocity = 0;

window.startAnim = function(type) {
  anim = type;
  t = 0;
};

window.addEventListener("DOMContentLoaded", () => {

  const anchor = document.querySelector("#anchor");
  const wrap = document.querySelector("#animWrap");
  const ui = document.querySelector("#ui");

  if (!anchor || !wrap) {
    console.error("Missing anchor or animWrap!");
    return;
  }

  // show/hide UI on target found/lost
  anchor.addEventListener("targetFound", () => {
    ui.style.display = "block";
  });
  anchor.addEventListener("targetLost", () => {
    ui.style.display = "none";
    anim = null;
  });

  // GLOBAL TOUCH / MOUSE: ignore touches that start inside the UI
  window.addEventListener("touchstart", (e) => {
    // if touch started inside #ui (button pressed) -> don't trigger squeeze
    if (e.target && e.target.closest && e.target.closest("#ui")) return;
    pressing = true;
  }, { passive: true });

  window.addEventListener("touchend", (e) => {
    // normal release (regardless of where)
    pressing = false;
  }, { passive: true });

  window.addEventListener("mousedown", (e) => {
    if (e.target && e.target.closest && e.target.closest("#ui")) return;
    pressing = true;
  });

  window.addEventListener("mouseup", () => {
    pressing = false;
  });

  // Animation controller
  AFRAME.registerComponent("anim-controller", {

  tick() {

    if (!wrap.object3D) return;

    const o = wrap.object3D;

    // ----------------------------
    // SQUEEZE (scale only)
    // ----------------------------

    const stiffness = 0.12;
    const damping = 0.85;

    const target = pressing ? 1 : 0;

    velocity += (target - squeeze) * stiffness;
    velocity *= damping;
    squeeze += velocity;

    const squash = 1 - squeeze * 0.5;
    const stretch = 1 + squeeze * 0.6;

    o.scale.set(stretch, squash, stretch);

    // reset motion layers each frame
    o.position.y = 0;
    o.rotation.z = 0;

    // ----------------------------
    // BUTTON ANIMATIONS
    // ----------------------------

    t += 0.05;

    switch(anim) {

      // Bounce → affects position only
      case "bounce": {

        const progress = Math.min(t / 1.6, 1);

        const bounce =
          Math.abs(Math.exp(-4 * progress) *
          Math.cos(12 * progress));

        o.position.y = bounce * 0.4;

        if (progress >= 1) anim = null;

        break;
      }

      // Jiggle → affects rotation only
      case "jiggle": {

        o.rotation.z = Math.sin(t * 12) * 0.15;

        if (t > Math.PI) anim = null;

        break;
      }

    }
  }

  });

  // attach controller
  wrap.setAttribute("anim-controller", "");
});
