precision highp float;
//Attributes
attribute vec3 position;

attribute vec2 posRef;
attribute vec2 uv;

attribute float bladeLengthRef;
attribute vec2 uvRef;
attribute vec4 deformRef;

// Uniforms
uniform mat4 worldViewProjection;

uniform sampler2D growthMap;
uniform vec2 zoneSize;
uniform float bladeHeight;
uniform vec3 offset;

uniform float time;

// Varying
varying vec4 vPosition;
varying vec2 vUV;
varying vec2 vUVRef;
varying float vBladePer;

vec2 rotate (float x, float y, float r) {
		float c = cos(r);
		float s = sin(r);
		return vec2(x * c - y * s, x * s + y * c);
	}


void main() {
    vec4 growth = texture(growthMap, uvRef);
    growth.x = 1.0;
    float invBladePer = 1.0-bladeLengthRef;

    vec4 p = vec4( position, 1. );

    p.xy *= growth.x*deformRef.x;

    vec2 dUV = uv*2.0-1.;

    float tipCurve = 1.0 - pow(invBladePer, 6.0);

    p.x *= tipCurve;
    dUV.x *= 0.5 - (tipCurve*-1.);

    float lean = deformRef.z*growth.x;
    lean = (lean *pow(invBladePer, 3.));
    p.z = lean;
    p.y *= sqrt(1.0 - (lean*lean));
    p.xz = rotate(p.x, p.z, deformRef.y*360.);
    p.xz += posRef;

    float wind = (sin(p.x + time) + cos(p.z + time))/2.;

    vec2 windDir = normalize(vec2(0.5, 0.5));
    float windSpeed = tan(cos(time))*0.2;
    windDir*=windSpeed;

    p.xz += (wind * (invBladePer * invBladePer ))*windDir;


    dUV/=2.0+1.0;

    vPosition = p;
    vUV = dUV;
    vUVRef = uvRef;
    vBladePer = bladeLengthRef;

    gl_Position = worldViewProjection * p;

}