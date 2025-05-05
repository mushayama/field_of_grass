import { Scene } from "@babylonjs/core/Scene";
import { Engine } from "@babylonjs/core/Engines";
import generatePOC1 from "./poc1";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

import "@babylonjs/core/Debug/debugLayer"; // Augments the scene with the debug methods
import "@babylonjs/inspector";
import { CreateGroundFromHeightMap } from "@babylonjs/core";
import generatePOC2 from "./poc2";
import generatePOC3 from "./poc3/poc3";

const canvas: HTMLCanvasElement = document.getElementById(
  "renderCanvas"
) as HTMLCanvasElement;

const engine = new Engine(canvas);

const createScene = (): Scene => {
  const scene = new Scene(engine);

  // Camera
  var camera = new ArcRotateCamera(
    "Camera",
    Math.PI / 2,
    Math.PI / 6,
    50,
    Vector3.Zero(),
    scene
  );
  camera.attachControl(canvas, true);
  camera.minZ = 0.1;

  // Light
  var light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);
  light.intensity = 0.7;

  if (window.location.href.includes("poc1")) {
    generatePOC1(scene);
  } else if (window.location.href.includes("poc2")) {
    generatePOC2(scene);
  } else if (window.location.href.includes("poc3")) {
    generatePOC3(scene);
  } else {
    // const sphere: BABYLON.Mesh = BABYLON.MeshBuilder.CreateSphere("sph", {
    //   segments: 5,
    //   diameter: 0.3,
    // });

    // const ground: BABYLON.GroundMesh = BABYLON.MeshBuilder.CreateGround(
    //   "ground",
    //   {
    //     height: 10,
    //     width: 10,
    //     subdivisions: 5,
    //   }
    // );

    // ground.material = new BABYLON.StandardMaterial("groundMat");
    // ground.material.wireframe = true;

    const groundFromHM = CreateGroundFromHeightMap(
      "groundHM",
      "../assets/Heightmap2.jpg",
      {
        width: 10,
        height: 10,
        subdivisions: 50,
      }
    );
  }

  return scene;
};

const scene: Scene = createScene();

engine.runRenderLoop(() => {
  scene.render();
  const fps = engine.getFps();
  document.getElementById("fps")!.innerHTML = fps.toFixed().toString() + " fps";
});

document.addEventListener("keydown", (event) => {
  if (event.key === "I" && event.shiftKey) {
    scene.debugLayer.show();
  }
});

window.addEventListener("resize", function () {
  engine.resize();
});
