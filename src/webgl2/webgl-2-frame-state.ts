import { mat4, mat3 } from 'gl-matrix';
import { DirectionalLight } from '../components/directional-light';

type MatrixCache = {
    modelView: mat4;
    modelViewProjection: mat4;
    normal: mat3;
};

type DirectionalLightCache = {
    count: number;
    directions: number[];
    colors: number[];
    intensities: number[];
    countNeedsUpdate: boolean;
    directionsNeedsUpdate: boolean;
    colorsNeedsUpdate: boolean;
    intensitiesNeedsUpdate: boolean;
};

export class WebGL2FrameState {
    gl: WebGL2RenderingContext;
    blendEnabled: boolean;
    cullFaceEnabled: boolean;
    matrixCache: MatrixCache;
    dirLightCache: DirectionalLightCache;

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
        this.blendEnabled = gl.isEnabled(gl.BLEND);
        this.cullFaceEnabled = gl.isEnabled(gl.CULL_FACE);

        this.matrixCache = {
            modelView: mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),
            modelViewProjection: mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),
            normal: mat3.fromValues(1, 0, 0, 0, 1, 0, 0, 0, 1),
        };

        this.dirLightCache = {
            count: 0,
            directions: [],
            colors: [],
            intensities: [],
            countNeedsUpdate: true,
            directionsNeedsUpdate: true,
            colorsNeedsUpdate: true,
            intensitiesNeedsUpdate: true,
        };
    }

    setBlendEnabled(flag: boolean): void {
        const gl = this.gl;

        if (this.blendEnabled !== flag) {
            this.blendEnabled = flag;
            if (this.blendEnabled) {
                gl.enable(gl.BLEND);
            } else {
                gl.disable(gl.BLEND);
            }
        }
    }

    setCullFaceEnabled(flag: boolean): void {
        const gl = this.gl;

        if (this.cullFaceEnabled !== flag) {
            this.cullFaceEnabled = flag;
            if (this.cullFaceEnabled) {
                gl.enable(gl.CULL_FACE);
            } else {
                gl.disable(gl.CULL_FACE);
            }
        }
    }

    cacheDirectionalLights(dirLights: DirectionalLight[]): void {
        this.dirLightCache.directions.length = 0;
        this.dirLightCache.colors.length = 0;
        this.dirLightCache.intensities.length = 0;

        this.dirLightCache.countNeedsUpdate = dirLights.length !== this.dirLightCache.count;
        this.dirLightCache.directionsNeedsUpdate = false;
        this.dirLightCache.colorsNeedsUpdate = false;
        this.dirLightCache.intensitiesNeedsUpdate = false;

        this.dirLightCache.count = dirLights.length;

        for (let i = 0; i < dirLights.length; i++) {
            const dirLight = dirLights[i];
            if (dirLight.data.webglDirty.direction) this.dirLightCache.directionsNeedsUpdate = true;
            if (dirLight.data.webglDirty.color) this.dirLightCache.colorsNeedsUpdate = true;
            if (dirLight.data.webglDirty.intensity) this.dirLightCache.intensitiesNeedsUpdate = true;

            for (let j = 0; j < dirLight.data.direction.length; j++) this.dirLightCache.directions.push(dirLight.data.direction[j]);
            for (let j = 0; j < dirLight.data.color.length; j++) this.dirLightCache.colors.push(dirLight.data.color[j]);
            this.dirLightCache.intensities.push(dirLight.data.intensity);
        }
    }
}