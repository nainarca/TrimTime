const nxPreset = require('@nx/jest/preset').default;

module.exports = {
  ...nxPreset,
  testMatch: ['**/+(*.)+(spec|test).[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  resolver: '@nx/jest/plugins/resolver',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageReporters: ['html'],
  passWithNoTests: true,
};
