export default [
  {
    method: 'GET',
    path: '/',
    handler: 'controller.index',
    config: {
      policies: [],
    },
  },
  {
    method: 'GET',
    path: '/test',
    handler: 'controller.test',
    config: {
      policies: [],
    },
  },
  {
    method: 'GET',
    path: '/crypto',
    handler: 'controller.testCrypto',
    config: {
      policies: [],
    },
  },
  {
    method: 'POST',
    path: '/crypto',
    handler: 'controller.testCrypto',
    config: {
      policies: [],
    },
  },
];
