import {
  CreateGround,
  Matrix,
  NodeMaterial,
  Scene,
  StandardMaterial,
  Texture,
} from "@babylonjs/core";

// https://playground.babylonjs.com/#A0YCX2#7
export default function generatePOC2(scene: Scene): void {
  const ground = CreateGround("ground", { width: 1000, height: 1000 }, scene);
  const groundMaterial = new StandardMaterial("groundMat", scene);
  const groundTexture = new Texture(
    "https://raw.githubusercontent.com/CedricGuillemet/dump/master/groundtexture.jpg",
    scene
  );
  groundTexture.uScale = 100;
  groundTexture.vScale = 100;
  groundMaterial.diffuseTexture = groundTexture;
  ground.material = groundMaterial;

  const blade = CreateGround("blade", { width: 1, height: 1 }, scene);
  blade.rotation.x = Math.PI * 0.5;
  blade.bakeCurrentTransformIntoVertices();

  NodeMaterial.ParseFromSnippetAsync("#8WH2KS#22", scene).then(
    (nodeMaterial) => {
      blade.material = nodeMaterial;
      nodeMaterial.backFaceCulling = false;
    }
  );

  const instanceCount = 40000;
  let m = Matrix.Identity();
  const matricesData = new Float32Array(16 * instanceCount);

  let index = 0;
  for (let y = 0; y < 200; y++) {
    for (let x = 0; x < 200; x++) {
      m.addAtIndex(12, (x + Math.cos((x + y) * 356.11)) * 0.5 - 10);
      m.addAtIndex(
        13,
        Math.cos((x + y) * 0.1) * 0.3 +
          0.3 +
          Math.cos((x + y) * 0.03) * 4 +
          2 +
          Math.sin(y * 0.009) * 10 +
          Math.random()
      );
      m.addAtIndex(14, (y + Math.cos((x - y) * 793.14)) * 0.5 - 10);
      m.copyToArray(matricesData, index * 16);
      index++;

      m.reset();
      m.addAtIndex(0, 1);
      m.addAtIndex(5, 1);
      m.addAtIndex(10, 1);
      m.addAtIndex(15, 1);
    }
  }

  blade.thinInstanceSetBuffer("matrix", matricesData, 16);
}
