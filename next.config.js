/** @type {import('next').NextConfig} */
const nextConfig = {
    basePath: '/agente',
        async headers() {
    return [
{
        source: '/:path*',
                  headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://www.rinoestoma.com' },
                  ],
          },
              ]
          },
          }

          module.exports = nextConfig
