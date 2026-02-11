let anim = null;
let t = 0;

window.startAnim = function(type) {
  anim = type;
  t = 0;
};

window.addEventListener("DOMContentLoaded", () => {

const anchor = document.querySelector("#anchor");
const ui = document.querySelector("#ui");
const ball = document.querySelector("#ball");

// show buttons when tracking works
anchor.addEventListener("targetFound", () => {
  ui.style.display = "block";
});

anchor.addEventListener("targetLost", () => {
  ui.style.display = "none";
});

// animation system
AFRAME.registerComponent("ball-anim", {
  tick() {

    if (!ball || !ball.object3D) return;

    const o = ball.object3D;
    t += 0.08;

    switch(anim) {

      case "squish":
        o.scale.set(1.2, 1 - Math.sin(t)*0.4, 1.2);
        if (t > Math.PI) reset();
        break;

      case "bounce":
        o.position.y = Math.abs(Math.sin(t))*0.5;
        if (t > Math.PI*2) resetPos();
        break;

      case "pulse":
        const s = 1 + Math.sin(t)*0.1;
        o.scale.set(s,s,s);
        break;

      case "jiggle":
        o.rotation.z = Math.sin(t*10)*0.2;
        if (t > Math.PI) resetRot();
        break;
    }
  }
});

function reset() {
  ball.object3D.scale.set(1,1,1);
  anim = null;
}

function resetPos() {
  ball.object3D.position.y = 0;
  anim = null;
}

function resetRot() {
  ball.object3D.rotation.z = 0;
  anim = null;
}

});
