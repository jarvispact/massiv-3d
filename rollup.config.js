import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import pkg from './package.json';

export default [
    {
        input: 'src/index.ts',
        output: [
            {
                file: pkg.main,
                format: 'cjs',
            },
            {
                file: pkg.module,
                format: 'es',
            },
            {
                name: 'MASSIV',
                file: pkg.browser,
                format: 'umd',
                globals: {
                    'gl-matrix': 'glMatrix',
                },
            },
        ],
        plugins: [
            resolve(),
            typescript(),
            peerDepsExternal(),
        ],
    },
];
