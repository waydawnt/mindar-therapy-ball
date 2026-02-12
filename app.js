// =================================
// GLOBAL STATE
// =================================

let anim = null;
let t = 0;

let pressing = false;
let squeeze = 0;
let velocity = 0;

window.startAnim = function(type) {
  anim = type;
  t = 0;
};

// =================================
// MAIN APP
// =================================

window.addEventListener("DOMContentLoaded", () => {

const anchor = document.querySelector("#anchor");
const wrap = document.querySelector("#animWrap");
const ball = document.querySelector("#ball");
const ui = document.querySelector("#ui");

// ----------------------------
// UI visibility
// ----------------------------

anchor.addEventListener("targetFound", () => {
  ui.style.display = "block";
});

anchor.addEventListener("targetLost", () => {
  ui.style.display = "none";
  anim = null;
});

// ----------------------------
// Clickable model interaction
// ----------------------------

ball.addEventListener("model-loaded", () => {

  // enable raycast on mesh
  ball.object3D.traverse(node => {
    if (node.isMesh) node.userData.clickable = true;
  });

  ball.addEventListener("mousedown", () => pressing = true);
  ball.addEventListener("mouseup", () => pressing = false);
  ball.addEventListener("mouseleave", () => pressing = false);

});

// =================================
// ANIMATION CONTROLLER
// =================================

AFRAME.registerComponent("anim-controller", {

  tick() {

    if (!wrap.object3D) return;

    const o = wrap.object3D;

    // ----------------------------
    // Gesture squeeze spring
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

    // ----------------------------
    // Button animations
    // ----------------------------

    t += 0.05;

    switch(anim) {

      // Bounce
      case "bounce": {

        const progress = Math.min(t / 1.6, 1);

        const bounce =
          Math.abs(Math.exp(-4 * progress) *
          Math.cos(12 * progress));

        o.position.y = bounce * 0.4;

        if (progress >= 1) {
          o.position.y = 0;
          anim = null;
        }

        break;
      }

      // Pulse
      case "pulse": {

        const s = 1 + Math.sin(t) * 0.08;
        o.scale.set(s, s, s);

        if (t > Math.PI * 4) anim = null;

        break;
      }

      // Jiggle
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

// attach controller
wrap.setAttribute("anim-controller", "");

});
