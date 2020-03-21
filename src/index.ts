import { glMatrix } from 'gl-matrix';

glMatrix.setMatrixArrayType(Array);

export * from './components/transform';

export * from './core/component';
export * from './core/entity';
export * from './core/system';
export * from './core/world';

export * from './systems/update-transform-system';