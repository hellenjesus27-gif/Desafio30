// Testes da lógica pura (pontuação/ranking) — independem do React Native.
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: { module: 'commonjs', target: 'es2020', strict: true, esModuleInterop: true, moduleResolution: 'node' } }],
  },
};
