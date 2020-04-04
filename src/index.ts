import { glMatrix } from 'gl-matrix';

glMatrix.setMatrixArrayType(Array);

export * from './components/orthographic-camera';
export * from './components/perspective-camera';
export * from './components/transform';

export * from './core/component';
export * from './core/event';
export * from './core/entity';
export * from './core/system';
export * from './core/world';

export * from './events/register-entity-event';
export * from './events/remove-entity-event';

export * from './systems/fps-debug-system';
export * from './systems/update-transform-system';

export * from './webgl2/webgl-2-utils';