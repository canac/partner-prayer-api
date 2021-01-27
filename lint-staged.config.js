module.exports = {
  'src/**/*.ts': () => ['tsc --noEmit', 'eslint . --cache'],
};
