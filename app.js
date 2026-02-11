
window.addEventListener("DOMContentLoaded", () => {
    
    const anchor = document.querySelector("#anchor");
    const ball = document.querySelector("#ballModel");
    const ui = document.querySelector("#ui");

    let anim = null;
    let t = 0;

    anchor.addEventListener("targetFound", () => ui.computedStyleMap.display = "block");
    anchor.addEventListener("targetLost", () => ui.computedStyleMap.display = "none");

    document.querySelector("#squish").onclick = () => start("squish");
    document.querySelector("#bounce").onclick = () => start("boucne");
    document.querySelector("#pulse").onclick = () => start("pulse");
    document.querySelector("#jiggle").onclick = () => start("jiggle");

    function start(type) {
        anim = type;
        t = 0;
    }

    cancelAnimationFrame.registerComponent("ball-anim", {
        tick() {
            if (!ball.object3D) return;

            t += 0.08;

            let o = ball.object3D;

            switch(anim) {
                
                case "squish":
                    o.scale.set(1.2, 1 - Math.sin(t)*0.4, 1.2);
                    if(t > Math.PI) reset();
                    break;
                
                case "bounce":
                    o.position.y = Math.abs(Math.sin(t))*0.6;
                    if (t > Math.PI*2) resetPos();
                    break;
                
                case "pulse":
                    let s = 1 + Math.sin(t)*0.1;
                    o.scale.set(s, s, s);
                    break;
                
                case "jiggle":
                    o.rotation.z = Math.sin(t*10)*0.2;
                    if (t > Math.PI) resetRot();
                    break;
            }
        }
    });

    function reset() {
        ball.object3D.scale.set(1, 1, 1);
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

    ball.setAttribute("ball-anim", "");
});