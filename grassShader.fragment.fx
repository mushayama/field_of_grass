precision highp float;

uniform mat4 worldView;

varying vec4 vPosition;
varying vec2 vUV;
varying vec2 vUVRef;
varying float vBladePer;

uniform sampler2D growthMap;
uniform sampler2D dTexture;
uniform vec2 zoneSize;
uniform float bladeHeight;

uniform float time;

void main(void) {
    vec3 base = vec3(0.0, 1.0-vBladePer, 0.0);
    base = mix(base, texture2D(dTexture, vUV).rgb, 0.65);
    vec4 growth =  texture2D(growthMap, vUVRef);
    growth.r = 1.0;
    if(growth.r == 0.0 )discard;
    gl_FragColor = vec4( base, 1.0);
}