import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';

const pages = [
    '00-hello-world',
    '01-handle-resize',
    '02-simple-animation',
];

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
            },
        ],
        plugins: [
            resolve(),
            typescript(),
        ],
    },
    ...pages.map(page => ({
        input: `examples/${page}/index.ts`,
        output: {
            name: 'MASSIV',
            file: `examples/${page}/bundle.js`,
            format: 'umd',
        },
        plugins: [
            resolve(),
            typescript({
                tsconfigOverride: {
                    compilerOptions: {
                        noEmit: true,
                        declaration: false,
                    },
                },
            }),
        ],
    })),
];
