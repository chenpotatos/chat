import express from 'express';
import path from 'path';
import axios from 'axios';
import fs from 'fs-extra';
const app = express();
const port = 8080;

const API = process.env.API || 'http://localhost:11001';
const clientUrl = `http://localhost:${port}`;
const clientId = process.env.ID || 'tc_649aa2179e97b8b3b2d1004f';
const clientSecret = process.env.SECRET || '4Pt4lccOaztJROs-VhmQf8XBU89-z8rr';

console.log('config:', {
  API,
  clientUrl,
  clientId,
});

const request = axios.create({
  baseURL: API,
  transformRequest: [
    function (data) {
      let ret = '';
      for (const it in data) {
        ret +=
          encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&';
      }
      ret = ret.substring(0, ret.lastIndexOf('&'));
      return ret;
    },
  ],
  headers: {
    'content-type': 'application/x-www-form-urlencoded',
  },
});

app.get('/', async (req, res) => {
  let html = (
    await fs.readFile(path.resolve(__dirname, './app.html'))
  ).toString();
  html = html
    .replace('<API>', API)
    .replace('<clientId>', clientId)
    .replace('<clientUrl>', clientUrl);

  res.send(html);
});

app.get('/cb', async (req, res, next) => {
  try {
    const { code, state } = req.query;

    console.log('code', code);

    // 根据获取到的code获取授权码
    const { data: tokenInfo } = await request.post('/open/token', {
      // client_id: 'foo',
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: `${clientUrl}/cb`,
      code,
      grant_type: 'authorization_code',
    });

    console.log('tokenInfo', tokenInfo);

    const { access_token, expires_in, id_token, scope, token_type } = tokenInfo;

    console.log('access_token', access_token);

    const { data: userInfo } = await request.post('/open/me', {
      access_token,
    });

    res.json({ userInfo });
  } catch (err) {
    console.error(err.response.data);
    next(err);
  }
});

app.listen(port, () => {
  console.log(
    `请确保第三方登录功能已启动并且回调已经被注册在OIDC服务端的白名单中: ${clientUrl}/cb`
  );
  console.log(`测试服务地址: http://127.0.0.1:${port}`);
});
