import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import packageJson from './package.json';
import { resolve } from 'path';

const external = id => {
    const exts = ['util', 'path', 'colors/safe', 'webpack'];
    for (const ext of exts) if (id === ext) return true;
    for (const pack of Object.keys(packageJson.dependencies)) {
        if (id === pack) {
            return true;
        }
    }
}

const plugins = [
    nodeResolve({
        preferBuiltins: false
    }),
    commonjs(),
    typescript({
        module: "ESNext"
    }),
]

const buildDir = 'build';

export default [
    {
        input: resolve(__dirname, "src/installer.ts"),
        output: [
            {
                file: resolve(__dirname, buildDir, 'installer.js'),
                format: "cjs",
            }
        ],
        external,
        plugins: plugins
    },
    {
        input: resolve(__dirname, "src/bundler.ts"),
        output: [
            {
                file: resolve(__dirname, buildDir, 'bundler.js'),
                format: "cjs",
            }
        ],
        external,
        plugins: plugins
    },
    {
        input: resolve(__dirname, "src/cli.ts"),
        output: [
            {
                file: resolve(__dirname, buildDir, 'cli.js'),
                format: "cjs",
            }
        ],
        external,
        plugins: plugins
    },
];