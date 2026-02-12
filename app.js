let anim = null;
let t = 0;

window.startAnim = type => {
  anim = type;
  t = 0;
};

window.addEventListener("DOMContentLoaded", () => {

const anchor = document.querySelector("#anchor");
const ui = document.querySelector("#ui");
const wrap = document.querySelector("#animWrap");

anchor.addEventListener("targetFound", () => {
  ui.style.display = "block";
});

anchor.addEventListener("targetLost", () => {
  ui.style.display = "none";
  anim = null;
});

AFRAME.registerComponent("anim-controller", {
  tick() {

    if (!wrap.object3D) return;

    const o = wrap.object3D;

    if (!wrap._smoothPos) {
      wrap._smoothPos = o.position.clone();
    }

    const alpha = 0.15;
    wrap._smoothPos.lerp(o.position, alpha);
    o.position.copy(wrap._smoothPos);

    t += 0.05;

    switch(anim) {

      case "squish": {
        // normalized animation time
        const duration = 1.4;
        const progress = Math.min(t / duration, 1);

        // spring easing (smooth compress + rebound)
        const spring =
          Math.exp(-6 * progress) *
          Math.cos(14 * progress);

        // squash amount
        const squash = 1 - (1 - spring) * 0.45;

        // volume preservation stretch
        const stretch = 1 + (1 - squash) * 0.6;

        o.scale.set(stretch, squash, stretch);

        if (progress >= 1) {
          o.scale.set(1,1,1);
          anim = null;
        }
        break;
      }

      case "bounce": {
        const progress = Math.min(t / 1.6, 1);
        const bounce =
          Math.abs(Math.exp(-4 * progress) *
          Math.cos(12 * progress));

        o.position.y = bounce * 0.5;

        if (progress >= 1) {
          o.position.y = 0;
          anim = null;
        }

        break;
      }

      case "pulse":
        const s = 1 + Math.sin(t)*0.08;
        o.scale.set(s,s,s);
        break;

      case "jiggle":
        o.rotation.z = Math.sin(t*12)*0.15;
        if (t > Math.PI) resetRot();
        break;
    }
  }
});

wrap.setAttribute("anim-controller", "");

function reset() {
  wrap.object3D.scale.set(1,1,1);
  anim = null;
}

function resetPos() {
  wrap.object3D.position.y = 0;
  anim = null;
}

function resetRot() {
  wrap.object3D.rotation.z = 0;
  anim = null;
}

});
