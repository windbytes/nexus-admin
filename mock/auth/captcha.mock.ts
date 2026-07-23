import { defineMock } from 'vite-plugin-mock-dev-server';
import { ok } from '../_util';

/** 简单 SVG 验证码图，登录页 Image 可直接展示 */
const CAPTCHA_SVG =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40">
      <rect width="100%" height="100%" fill="#f0f2f5"/>
      <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle"
        font-family="monospace" font-size="20" fill="#1677ff">MOCK</text>
    </svg>`
  );

export default defineMock({
  url: '/api/sys/framework/captcha/:key',
  method: 'GET',
  body: () => ok(CAPTCHA_SVG),
});
