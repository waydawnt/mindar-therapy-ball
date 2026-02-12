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

      case "squish":
        o.scale.set(1.2, 1 - Math.sin(t)*0.35, 1.2);
        if (t > Math.PI) reset();
        break;

      case "bounce":
        o.position.y = Math.abs(Math.sin(t))*0.4;
        if (t > Math.PI*2) resetPos();
        break;

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
