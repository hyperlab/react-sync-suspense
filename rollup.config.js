import babel from 'rollup-plugin-babel';

export default {
  input: 'modules/index.js',
  output: {
    file: 'dist/index.js',
    format: 'cjs'
  },
  plugins: [
    babel({
      presets: [['env', { modules: false }], 'react'],
      plugins: 'transform-class-properties'
    })
  ]
};
