'use strict';

module.exports = {
  'src/**/*.ts': (files) => [
    'tsc --noEmit',
    `eslint --cache ${files.join(' ')}`,
  ],
};
