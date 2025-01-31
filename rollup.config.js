import tsPlugin from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";

export default [
  {
    input: "src/index.ts",
    output: {
      dir: "dist/esm",
      format: "esm",
      preserveModules: true,
      preserveModulesRoot: "src",
    },
    plugins: [
      tsPlugin({
        declaration: true,
        declarationDir: "dist/esm/",
        outDir: "dist/esm",
      }),
      resolve({
        extensions: [".ts", ".js"],
      }),
    ],
  },
  {
    input: "src/index.ts",
    output: {
      dir: "dist/cjs",
      format: "cjs",
      preserveModules: true,
      preserveModulesRoot: "src",
    },
    plugins: [
      tsPlugin({
        outDir: "dist/cjs",
      }),
      resolve({
        extensions: [".ts", ".js"],
      }),
    ],
  },
];
