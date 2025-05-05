import { CreateGround, Scene } from "@babylonjs/core";
import { Grass } from "./grass3";

//https://www.html5gamedevs.com/topic/36654-need-some-math-help/#comment-210115
export default function generatePOC3(scene: Scene): void {
  let ground = CreateGround(
    "ground1",
    { width: 10, height: 10, subdivisions: 2 },
    scene
  );

  let grass = new Grass(
    { bladeWidth: 0.1, bladeHeight: 1.5, bladeYsegs: 16, density: 0.2 },
    scene
  );
  let grass2 = new Grass(
    { bladeWidth: 0.15, bladeHeight: 0.65, bladeYsegs: 8, density: 0.4 },
    scene
  );
  let grass3 = new Grass(
    { bladeWidth: 0.23, bladeHeight: 0.325, bladeYsegs: 3, density: 0.6 },
    scene
  );
}
