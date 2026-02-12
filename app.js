let anim = null;
let t = 0;

let pressing = false;
let squeeze = 0;
let velocity = 0;

window.startAnim = type => {
  anim = type;
  t = 0;
};

window.addEventListener("DOMContentLoaded", () => {

const anchor = document.querySelector("#anchor");
const wrap = document.querySelector("#animWrap");
const ui = document.querySelector("#ui");
const hint = document.querySelector("#hint");

anchor.addEventListener("targetFound", () => {
  ui.style.display = "flex";
  
  requestAnimationFrame(() => {
    ui.classList.add("show");
    hint.classList.add("show");
  });
});

anchor.addEventListener("targetLost", () => {
  ui.classList.remove("show");
  hint.classList.remove("show");

  setTimeout(() => {
    ui.style.display = "none";
  }, 300);
});

// ignore UI taps for squeeze
window.addEventListener("touchstart", e => {
  if (e.target.closest("#ui")) return;
  pressing = true;
  hint.style.opacity = 0;
}, {passive:true});

window.addEventListener("touchend", () => pressing = false);

window.addEventListener("mousedown", e => {
  if (e.target.closest("#ui")) return;
  pressing = true;
});

window.addEventListener("mouseup", () => pressing = false);

AFRAME.registerComponent("anim-controller", {

  tick() {

    if (!wrap.object3D) return;

    const o = wrap.object3D;

    // squeeze physics
    const stiffness = 0.12;
    const damping = 0.85;

    const target = pressing ? 1 : 0;

    velocity += (target - squeeze) * stiffness;
    velocity *= damping;
    squeeze += velocity;

    const squash = 1 - squeeze * 0.5;
    const stretch = 1 + squeeze * 0.6;

    o.scale.set(stretch, squash, stretch);

    // reset layers
    o.position.y = 0;
    o.rotation.z = 0;

    t += 0.05;

    switch(anim) {

      case "bounce": {
        const duration = 1.4;
        const p = Math.min(t / duration, 1);

        const height = Math.abs(Math.sin(p * Math.PI * 2.2)) * (1 - p);

        o.position.y = height * 0.6;

        const impact = 1 - height;

        const squash = 1 - impact * 0.25;
        const stretch = 1 + impact * 0.25;

        o.scale.x *= stretch;
        o.scale.y *= squash;
        o.scale.z *= stretch;

        if (p >= 1) {
          o.position.y = 0;
          anim = null;
        }

        break;
      }

      case "jiggle": {
        o.rotation.z = Math.sin(t * 12) * 0.15;

        if (t > Math.PI) anim = null;
        break;
      }

    }

  }

});

wrap.setAttribute("anim-controller", "");

});
