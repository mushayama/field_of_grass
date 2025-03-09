import {
  Buffer,
  CreateBox,
  CreateGround,
  Effect,
  Engine,
  Mesh,
  Scene,
  ShaderMaterial,
  ShaderStore,
  Texture,
  Vector2,
  Vector3,
  VertexData,
} from "@babylonjs/core";

function randomBetween(min: number, max: number): number {
  if (min < 0) {
    return min + Math.random() * (Math.abs(min) + max);
  } else {
    return min + Math.random() * max;
  }
}

const GROWTH_MAP_URL =
  "https://cdn.rawgit.com/Pryme8/Pryme8.github.io/57985182/cloudAssets/textures/fixed-growth-map.png";
const DIFFUSE_TEXTURE_URL =
  "https://cdn.rawgit.com/Pryme8/Pryme8.github.io/8a0e09a5/cloudAssets/textures/grass_blade.png";

// const VERTEX_SHADER_CODE = `precision highp float;
// //Attributes
// attribute vec3 position;

// attribute vec2 posRef;
// attribute vec2 uv;

// attribute float bladeLengthRef;
// attribute vec2 uvRef;
// attribute vec4 deformRef;

// // Uniforms
// uniform mat4 worldViewProjection;

// uniform sampler2D growthMap;
// uniform vec2 zoneSize;
// uniform float bladeHeight;
// uniform vec3 offset;

// uniform float time;

// // Varying
// varying vec4 vPosition;
// varying vec2 vUV;
// varying vec2 vUVRef;
// varying float vBladePer;

// vec2 rotate (float x, float y, float r) {
// 		float c = cos(r);
// 		float s = sin(r);
// 		return vec2(x * c - y * s, x * s + y * c);
// 	}

// void main() {
//     vec4 growth = texture(growthMap, uvRef);
//     growth.x = 1.0;
//     float invBladePer = 1.0-bladeLengthRef;

//     vec4 p = vec4( position, 1. );

//     p.xy *= growth.x*deformRef.x;

//     vec2 dUV = uv*2.0-1.;

//     float tipCurve = 1.0 - pow(invBladePer, 6.0);

//     p.x *= tipCurve;
//     dUV.x *= 0.5 - (tipCurve*-1.);

//     float lean = deformRef.z*growth.x;
//     lean = (lean *pow(invBladePer, 3.));
//     p.z = lean;
//     p.y *= sqrt(1.0 - (lean*lean));
//     p.xz = rotate(p.x, p.z, deformRef.y*360.);
//     p.xz += posRef;

//     float wind = (sin(p.x + time) + cos(p.z + time))/2.;

//     vec2 windDir = normalize(vec2(0.5, 0.5));
//     float windSpeed = tan(cos(time))*0.2;
//     windDir*=windSpeed;

//     p.xz += (wind * (invBladePer * invBladePer ))*windDir;

//     dUV/=2.0+1.0;

//     vPosition = p;
//     vUV = dUV;
//     vUVRef = uvRef;
//     vBladePer = bladeLengthRef;

//     gl_Position = worldViewProjection * p;

// }`;

// const FRAGMENT_SHADER_CODE = `precision highp float;

// uniform mat4 worldView;

// varying vec4 vPosition;
// varying vec2 vUV;
// varying vec2 vUVRef;
// varying float vBladePer;

// uniform sampler2D growthMap;
// uniform sampler2D dTexture;
// uniform vec2 zoneSize;
// uniform float bladeHeight;

// uniform float time;

// void main(void) {
//     vec3 base = vec3(0.0, 1.0-vBladePer, 0.0);
//     base = mix(base, texture2D(dTexture, vUV).rgb, 0.65);
//     vec4 growth =  texture2D(growthMap, vUVRef);
//     growth.r = 1.0;
//     if(growth.r == 0.0 )discard;
//     gl_FragColor = vec4( base, 1.0);
// }`;

interface GrassArgs {
  bladeHeight?: number;
  bladeWidth?: number;
  zoneSize?: Vector2;
  bladeYsegs?: number;
  bladeXsegs?: number;
  density?: number;
}

class Grass {
  private scene: Scene;
  private args: GrassArgs;
  private _time: number = 0;
  private mesh!: Mesh;
  private engine: Engine;

  constructor(args: GrassArgs = {}, scene: Scene, engine: Engine) {
    this.scene = scene;
    this.engine = engine;
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

    var posRefBuffer = new Buffer(this.engine, posRef, false, 2);
    this.mesh.setVerticesBuffer(
      posRefBuffer.createVertexBuffer("posRef", 0, 2)
    );

    var uvRefBuffer = new Buffer(this.engine, uvRef, false, 2);
    this.mesh.setVerticesBuffer(uvRefBuffer.createVertexBuffer("uvRef", 0, 2));

    var bladeLengthRefBuffer = new Buffer(
      this.engine,
      bladeLengthRef,
      false,
      1
    );
    this.mesh.setVerticesBuffer(
      bladeLengthRefBuffer.createVertexBuffer("bladeLengthRef", 0, 1)
    );

    var deformRefBuffer = new Buffer(this.engine, deformRef, false, 4);
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
      this._time += this.engine.getDeltaTime() * 0.001;
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

// const GRASS = function (args: GrassArgs, scene: Scene): Mesh {
//   args = args || {};
//   args.bladeHeight = args.bladeHeight || 1;
//   args.bladeWidth = args.bladeWidth || 0.1;
//   args.zoneSize = args.zoneSize || new Vector2(10, 10);
//   this.scene = scene;

//   this.args = args;

//   this.init();

//   return this;
// };

// GRASS.prototype = {
//   init: function () {
//     this.Distribute(this.CreateBaseStrip());
//   },
//   CreateBaseStrip: function () {
//     var args = this.args;
//     var scene = this.scene;
//     var width = args.bladeWidth || 1;
//     var height = args.bladeHeight || 1;
//     var width_half = width / 2;
//     var height_half = height / 2;
//     var gridX = Math.floor(args.bladeXsegs) || 1;
//     var gridY = Math.floor(args.bladeYsegs) || 1;
//     var gridX1 = gridX + 1;
//     var gridY1 = gridY + 1;
//     var segment_width = width / gridX;
//     var segment_height = height / gridY;
//     var ix, iy;
//     // buffers
//     var vDat = new VertexData();
//     var indices = (vDat.indices = []);
//     var positions = (vDat.positions = []);
//     var normals = (vDat.normals = []);
//     var uvs = (vDat.uvs = []);

//     // generate vertices, normals and uvs
//     for (iy = 0; iy < gridY1; iy++) {
//       var y = iy * segment_height - height_half;
//       for (ix = 0; ix < gridX1; ix++) {
//         var x = ix * segment_width - width_half;
//         positions.push(x, -y, 0);
//         normals.push(0, 0, 1);
//         uvs.push(ix / gridX);
//         uvs.push(1 - iy / gridY);
//       }
//     }
//     // indices
//     for (iy = 0; iy < gridY; iy++) {
//       for (ix = 0; ix < gridX; ix++) {
//         var a = ix + gridX1 * iy;
//         var b = ix + gridX1 * (iy + 1);
//         var c = ix + 1 + gridX1 * (iy + 1);
//         var d = ix + 1 + gridX1 * iy;
//         // faces
//         indices.push(a, b, d, b, c, d);
//         indices.push(d, c, b, d, b, a);
//       }
//     }

//     var mesh = new Mesh("", scene);
//     vDat.applyToMesh(mesh);
//     mesh.position.y = height_half;
//     mesh.bakeCurrentTransformIntoVertices();

//     return mesh;
//   },
//   Distribute: function (mesh: Mesh) {
//     var scene = this.scene;
//     mesh.setEnabled(false);
//     var meshes = [];
//     var density = this.args.density || 0.2;
//     var xp, yp;
//     var temp;

//     var uvRef = [];
//     var deformRef = [];
//     var posRef = [];
//     var bladeLengthRef = [];

//     var gridX = Math.floor(this.args.bladeXsegs) || 1;
//     var gridY = Math.floor(this.args.bladeYsegs) || 1;

//     var mx = this.args.zoneSize.x,
//       my = this.args.zoneSize.y;

//     for (var y = 0; y < my; y += density) {
//       for (var x = 0; x < mx; x += density) {
//         xp = x - mx * 0.5;
//         yp = y - my * 0.5;
//         temp = mesh.clone("temp");
//         //temp.position.x = xp;
//         //temp.position.z = yp;
//         //SET ATTRIBUTE DATA~
//         var _scale = randomBetween(0.5, 1.5);
//         var _rotate = randomBetween(0, 1);
//         var _curve = randomBetween(0.2, 0.8);

//         for (var segY = 0; segY <= gridY; segY++) {
//           var bladePer = 0;
//           if (segY > 0) {
//             bladePer = segY / gridY;
//           }
//           for (var segX = 0; segX <= gridX; segX++) {
//             posRef.push(xp, yp);
//             uvRef.push(x / mx, y / my);
//             deformRef.push(_scale, _rotate, _curve, 0);
//             bladeLengthRef.push(bladePer);
//           }
//         }

//         meshes.push(temp);
//       }
//     }

//     mesh.dispose();
//     mesh = Mesh.MergeMeshes(meshes, true, true)!;

//     var posRefBuffer = new Buffer(, posRef, false, 2);
//     mesh.setVerticesBuffer(posRefBuffer.createVertexBuffer("posRef", 0, 2));

//     var uvRefBuffer = new Buffer(scene.getEngine(), uvRef, false, 2);
//     mesh.setVerticesBuffer(uvRefBuffer.createVertexBuffer("uvRef", 0, 2));

//     var bladeLengthRefBuffer = new Buffer(
//       scene.getEngine(),
//       bladeLengthRef,
//       false,
//       1
//     );
//     mesh.setVerticesBuffer(
//       bladeLengthRefBuffer.createVertexBuffer("bladeLengthRef", 0, 1)
//     );

//     var deformRefBuffer = new Buffer(scene.getEngine(), deformRef, false, 4);
//     mesh.setVerticesBuffer(
//       deformRefBuffer.createVertexBuffer("deformRef", 0, 4)
//     );

//     console.log(mesh);

//     var grassMat = new ShaderMaterial(
//       "grass",
//       scene,
//       {
//         vertexElement: "grass",
//         fragmentElement: "grass",
//       },
//       {
//         attributes: [
//           "position",
//           "uv",
//           "posRef",
//           "bladeLengthRef",
//           "uvRef",
//           "deformRef",
//         ],
//         samplers: ["growthMap", "dTexture"],
//         uniforms: ["worldViewProjection", "time", "zoneSize", "bladeHeight"],
//       }
//     );

//     this._time = 0;

//     grassMat.setTexture("growthMap", new Texture(GROWTH_MAP_URL, scene));
//     grassMat.setTexture(
//       "dTexture",
//       new Texture(DIFFUSE_TEXTURE_URL, scene)
//     );

//     grassMat.setVector2("zoneSize", this.args.zoneSize);
//     grassMat.setFloat("bladeHeight", this.args.bladeHeight);

//     var self = this;
//     scene.registerBeforeRender(() => {
//       grassMat.setFloat("time", self._time);
//       self._time += self.scene._engine._deltaTime * 0.001;
//     });

//     mesh.material = grassMat;

//     var _bb = CreateBox("tempBox", 1, scene);
//     _bb.scaling = new Vector3(
//       this.args.zoneSize.x,
//       this.args.bladeHeight * 2.0,
//       this.args.zoneSize.y
//     );
//     _bb.position.y = this.args.bladeHeight * 2.0 * 0.5;
//     _bb.bakeCurrentTransformIntoVertices();

//     mesh.setBoundingInfo(_bb.getBoundingInfo());
//     _bb.dispose();
//   },
// };

export default function generatePOC2(scene: Scene, engine: Engine): void {
  //   Effect.ShadersStore["customVertexShader"] = VERTEX_SHADER_CODE;
  //   Effect.ShadersStore["customFragmentShader"] = FRAGMENT_SHADER_CODE;

  let ground = CreateGround(
    "ground1",
    { width: 10, height: 10, subdivisions: 2 },
    scene
  );

  let grass = new Grass(
    { bladeWidth: 0.1, bladeHeight: 1.5, bladeYsegs: 16, density: 0.2 },
    scene,
    engine
  );
  let grass2 = new Grass(
    { bladeWidth: 0.15, bladeHeight: 0.65, bladeYsegs: 8, density: 0.4 },
    scene,
    engine
  );
  let grass3 = new Grass(
    { bladeWidth: 0.23, bladeHeight: 0.325, bladeYsegs: 3, density: 0.6 },
    scene,
    engine
  );
  //     let grass = new GRASS(
  //     { bladeWidth: 0.1, bladeHeight: 1.5, bladeYsegs: 16, density: 0.2 },
  //     scene
  //   );
  //   let grass2 = new GRASS(
  //     { bladeWidth: 0.15, bladeHeight: 0.65, bladeYsegs: 8, density: 0.4 },
  //     scene
  //   );
  //   let grass3 = new GRASS(
  //     { bladeWidth: 0.23, bladeHeight: 0.325, bladeYsegs: 3, density: 0.6 },
  //     scene
  //   );
}
