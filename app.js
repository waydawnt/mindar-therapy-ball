// app.js - stabilizer + local animation controller

// animation state
let anim = null;
let t = 0;

// global trigger used by inline button onclick handlers
window.startAnim = function(type) {
  anim = type;
  t = 0;
};

window.addEventListener("DOMContentLoaded", () => {

  const anchor = document.querySelector("#anchor");         // MindAR-driven anchor
  const stabilizer = document.querySelector("#stabilizer"); // our smoothed follow object
  const ball = document.querySelector("#ball");
  const ui = document.querySelector("#ui");

  if (!anchor || !stabilizer || !ball) {
    console.error("Required entities missing: anchor/stabilizer/ball");
    return;
  }

  // show/hide UI and stabilizer when target found/lost
  anchor.addEventListener("targetFound", () => {
    ui.style.display = "block";
    stabilizer.setAttribute("visible", "true");
  });

  anchor.addEventListener("targetLost", () => {
    ui.style.display = "none";
    stabilizer.setAttribute("visible", "false");
    anim = null;
  });

  // smoothing state
  const prevPos = new THREE.Vector3();
  const prevQuat = new THREE.Quaternion();
  const tmpPos = new THREE.Vector3();
  const tmpQuat = new THREE.Quaternion();

  // smoothing factor: 0.1 = heavy smoothing (stable but slow), 0.3 = lighter smoothing
  const SMOOTH_ALPHA = 0.20;

  // register frame-level stabilizer component (attached to scene automatically)
  AFRAME.registerComponent("stabilizer", {
    tick: function() {
      // ensure anchor has a world transform
      if (!anchor.object3D) return;

      // read anchor world pose
      anchor.object3D.getWorldPosition(tmpPos);
      anchor.object3D.getWorldQuaternion(tmpQuat);

      // lerp / slerp toward the new pose (this smooths jitter)
      prevPos.lerp(tmpPos, SMOOTH_ALPHA);
      prevQuat.slerp(tmpQuat, SMOOTH_ALPHA);

      // write smoothed world pose to stabilizer (stabilizer is scene-rooted)
      stabilizer.object3D.position.copy(prevPos);
      stabilizer.object3D.quaternion.copy(prevQuat);
    }
  });

  // attach stabilizer component to the scene so it ticks
  document.querySelector("a-scene").setAttribute("stabilizer", "");

  // register local animation component that acts on the ball's local transform
  AFRAME.registerComponent("ball-anim-local", {
    tick: function() {
      if (!ball || !ball.object3D) return;

      const o = ball.object3D;
      // small timestep for smoother motion
      t += 0.05;

      switch(anim) {
        case "squish":
          // local scale change (squash in Y, expand X/Z a bit)
          o.scale.set(1.2, 1 - Math.sin(t) * 0.35, 1.2);
          if (t > Math.PI) { reset(); }
          break;

        case "bounce":
          // local vertical offset relative to stabilizer (model-level bounce)
          o.position.y = Math.abs(Math.sin(t)) * 0.45;
          if (t > Math.PI * 2) { resetPos(); }
          break;

        case "pulse":
          // gentle breathing
          const s = 1 + Math.sin(t) * 0.08;
          o.scale.set(s, s, s);
          break;

        case "jiggle":
          // quick local rotation wobble
          o.rotation.z = Math.sin(t * 12) * 0.16;
          if (t > Math.PI) { resetRot(); }
          break;
      }
    }
  });

  // attach component to model entity
  ball.setAttribute("ball-anim-local", "");

  // reset helpers (work on local model)
  function reset() {
    if (ball && ball.object3D) ball.object3D.scale.set(1, 1, 1);
    anim = null;
  }
  function resetPos() {
    if (ball && ball.object3D) ball.object3D.position.y = 0;
    anim = null;
  }
  function resetRot() {
    if (ball && ball.object3D) ball.object3D.rotation.z = 0;
    anim = null;
  }

});
