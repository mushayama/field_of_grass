import { Scene } from "@babylonjs/core/Scene";
// import { CreateSphere } from "@babylonjs/core/Meshes/Builders/sphereBuilder";

//https://playground.babylonjs.com/#2322Y7#0
import { FurMaterial } from "@babylonjs/materials/fur/furMaterial";
import {
  Color3,
  CreateGround,
  // CreateGroundFromHeightMap,
  Texture,
  Vector3,
} from "@babylonjs/core";
// import furTexture from "../assets/textures_fur.jpg";
import grassTexture from "../assets/grass.jpeg";

export default function generatePOC1(scene: Scene): void {
  // let baseMesh = CreateSphere("sphere1", {}, scene);
  let baseMesh = CreateGround(
    "ground",
    {
      width: 10,
      height: 10,
    },
    scene
  );
  // let baseMesh = CreateGroundFromHeightMap(
  //   "groundHM",
  //   "../assets/Heightmap2.jpg",
  //   {
  //     width: 10,
  //     height: 10,
  //     subdivisions: 50,
  //   },
  //   scene
  // );

  // Fur Material
  let furMaterial = new FurMaterial("fur", scene);
  furMaterial.furLength = 4;
  furMaterial.furAngle = 0;
  furMaterial.furColor = new Color3(1, 1, 1);
  furMaterial.diffuseTexture = new Texture(grassTexture, scene);
  furMaterial.furTexture = FurMaterial.GenerateTexture("furTexture", scene);
  furMaterial.furSpacing = 6;
  furMaterial.furDensity = 10;
  furMaterial.furSpeed = 200;
  furMaterial.furGravity = new Vector3(0, -1, 0);

  baseMesh.material = furMaterial;

  let quality = 30;
  let shells = FurMaterial.FurifyMesh(baseMesh, quality);
}
