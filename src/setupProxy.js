const { createProxyMiddleware } = require('http-proxy-middleware');

const apiPaths = [
  '/auth',
  '/api',
  '/api-docs',
  '/users',
  '/attendance',
  '/schedules',
  '/employeesAttendance',
  '/uploads',
  '/ping',
  '/version',
];

module.exports = function (app) {
  app.use(
    createProxyMiddleware(
      (pathname, req) => {
        const isApiPath = apiPaths.some((p) => pathname.startsWith(p));
        // Browser page navigations (direct URL entry / refresh) request text/html;
        // those must fall through to CRA's SPA fallback instead of hitting the
        // backend, since paths like /attendance and /api-docs are also React routes.
        const isPageNavigation = (req.headers.accept || '').includes('text/html');
        return isApiPath && !isPageNavigation;
      },
      {
        target: 'https://api.inout.urbancode.tech',
        changeOrigin: true,
        secure: true,
        logLevel: 'silent',
      }
    )
  );
};
