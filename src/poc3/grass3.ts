import {
  Buffer,
  CreateBox,
  Mesh,
  Scene,
  ShaderMaterial,
  Texture,
  Vector2,
  Vector3,
  VertexData,
} from "@babylonjs/core";

const GROWTH_MAP_URL =
  "https://cdn.rawgit.com/Pryme8/Pryme8.github.io/57985182/cloudAssets/textures/fixed-growth-map.png";
const DIFFUSE_TEXTURE_URL =
  "https://cdn.rawgit.com/Pryme8/Pryme8.github.io/8a0e09a5/cloudAssets/textures/grass_blade.png";

function randomBetween(min: number, max: number): number {
  if (min < 0) {
    return min + Math.random() * (Math.abs(min) + max);
  } else {
    return min + Math.random() * max;
  }
}

interface GrassArgs {
  bladeHeight?: number;
  bladeWidth?: number;
  zoneSize?: Vector2;
  bladeYsegs?: number;
  bladeXsegs?: number;
  density?: number;
}

export class Grass {
  private scene: Scene;
  private args: GrassArgs;
  private _time: number = 0;
  private mesh!: Mesh;

  constructor(args: GrassArgs = {}, scene: Scene) {
    this.scene = scene;
    this.args = {
      bladeHeight: args.bladeHeight ?? 1,
      bladeWidth: args.bladeWidth ?? 0.1,
      zoneSize: args.zoneSize ?? new Vector2(10, 10),
      bladeXsegs: args.bladeXsegs ?? 1,
      bladeYsegs: args.bladeYsegs ?? 1,
      density: args.density ?? 0.2,
    };

    this.init();
  }

  private init(): void {
    this.distribute(this.createBaseStrip());
  }

  private createBaseStrip(): Mesh {
    const { bladeWidth, bladeHeight, bladeXsegs, bladeYsegs } = this.args;
    const width_half = bladeWidth! / 2;
    const height_half = bladeHeight! / 2;
    const gridX = Math.floor(bladeXsegs!) || 1;
    const gridY = Math.floor(bladeYsegs!) || 1;
    const gridX1 = gridX + 1;
    const gridY1 = gridY + 1;
    const segment_width = bladeWidth! / gridX;
    const segment_height = bladeHeight! / gridY;

    // buffers
    const vDat = new VertexData();
    const indices: number[] = [];
    const positions: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];

    // generate vertices, normals and uvs
    for (let iy = 0; iy < gridY1; iy++) {
      const y = iy * segment_height - height_half;
      for (let ix = 0; ix < gridX1; ix++) {
        const x = ix * segment_width - width_half;
        positions.push(x, -y, 0);
        normals.push(0, 0, 1);
        uvs.push(ix / gridX);
        uvs.push(1 - iy / gridY);
      }
    }

    // indices
    for (let iy = 0; iy < gridY; iy++) {
      for (let ix = 0; ix < gridX; ix++) {
        const a = ix + gridX1 * iy;
        const b = ix + gridX1 * (iy + 1);
        const c = ix + 1 + gridX1 * (iy + 1);
        const d = ix + 1 + gridX1 * iy;
        // faces
        indices.push(a, b, d, b, c, d);
        indices.push(d, c, b, d, b, a);
      }
    }

    var mesh = new Mesh("", this.scene);
    vDat.indices = indices;
    vDat.positions = positions;
    vDat.normals = normals;
    vDat.uvs = uvs;
    vDat.applyToMesh(mesh);
    mesh.position.y = height_half;
    mesh.bakeCurrentTransformIntoVertices();

    return mesh;
  }

  private distribute(baseMesh: Mesh): void {
    baseMesh.setEnabled(false);
    const meshes: Mesh[] = [];
    const { density, zoneSize, bladeXsegs, bladeYsegs } = this.args;
    const mx = zoneSize!.x;
    const my = zoneSize!.y;
    const gridX = Math.floor(bladeXsegs!) || 1;
    const gridY = Math.floor(bladeYsegs!) || 1;

    const uvRef: number[] = [];
    const deformRef: number[] = [];
    const posRef: number[] = [];
    const bladeLengthRef: number[] = [];

    for (let y = 0; y < my; y += density!) {
      for (let x = 0; x < mx; x += density!) {
        const xp = x - mx * 0.5;
        const yp = y - my * 0.5;
        const temp = baseMesh.clone("temp");

        const _scale = randomBetween(0.5, 1.5);
        const _rotate = randomBetween(0, 1);
        const _curve = randomBetween(0.2, 0.8);

        for (let segY = 0; segY <= gridY; segY++) {
          let bladePer = 0;
          if (segY > 0) {
            bladePer = segY / gridY;
          }
          for (var segX = 0; segX <= gridX; segX++) {
            posRef.push(xp, yp);
            uvRef.push(x / mx, y / my);
            deformRef.push(_scale, _rotate, _curve, 0);
            bladeLengthRef.push(bladePer);
          }
        }

        meshes.push(temp);
      }
    }

    baseMesh.dispose();
    this.mesh = Mesh.MergeMeshes(meshes, true, true)!;

    var posRefBuffer = new Buffer(this.scene.getEngine(), posRef, false, 2);
    this.mesh.setVerticesBuffer(
      posRefBuffer.createVertexBuffer("posRef", 0, 2)
    );

    var uvRefBuffer = new Buffer(this.scene.getEngine(), uvRef, false, 2);
    this.mesh.setVerticesBuffer(uvRefBuffer.createVertexBuffer("uvRef", 0, 2));

    var bladeLengthRefBuffer = new Buffer(
      this.scene.getEngine(),
      bladeLengthRef,
      false,
      1
    );
    this.mesh.setVerticesBuffer(
      bladeLengthRefBuffer.createVertexBuffer("bladeLengthRef", 0, 1)
    );

    var deformRefBuffer = new Buffer(
      this.scene.getEngine(),
      deformRef,
      false,
      4
    );
    this.mesh.setVerticesBuffer(
      deformRefBuffer.createVertexBuffer("deformRef", 0, 4)
    );

    console.log(this.mesh);

    this.applyShader();
  }

  private applyShader(): void {
    var grassMat = new ShaderMaterial("grass", this.scene, "./grassShader", {
      attributes: [
        "position",
        "uv",
        "posRef",
        "bladeLengthRef",
        "uvRef",
        "deformRef",
      ],
      samplers: ["growthMap", "dTexture"],
      uniforms: ["worldViewProjection", "time", "zoneSize", "bladeHeight"],
    });

    this._time = 0;

    grassMat.setTexture("growthMap", new Texture(GROWTH_MAP_URL, this.scene));
    grassMat.setTexture(
      "dTexture",
      new Texture(DIFFUSE_TEXTURE_URL, this.scene)
    );

    grassMat.setVector2("zoneSize", this.args.zoneSize!);
    grassMat.setFloat("bladeHeight", this.args.bladeHeight!);

    this.scene.registerBeforeRender(() => {
      grassMat.setFloat("time", this._time);
      this._time += this.scene.getEngine().getDeltaTime() * 0.001;
    });

    this.mesh.material = grassMat;

    const _bb = CreateBox("tempBox", { size: 1 }, this.scene);
    _bb.scaling = new Vector3(
      this.args.zoneSize!.x,
      this.args.bladeHeight! * 2.0,
      this.args.zoneSize!.y
    );
    _bb.position.y = this.args.bladeHeight! * 2.0 * 0.5;
    _bb.bakeCurrentTransformIntoVertices();
    this.mesh.setBoundingInfo(_bb.getBoundingInfo());
    _bb.dispose();
  }
}
