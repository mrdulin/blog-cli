const express = require('express');
const path = require('path');
const open = require('open');

const util = require('./util');

module.exports = dir => {
  const dirname = dir || '.';

  const config = util.loadConfig(dirname);
  const port = config.port || 3000;
  const host = 'http://127.0.0.1';
  const app = express();
  const router = express.Router();

  app.use('/assets', express.static(path.resolve(dirname, 'assets')));
  app.use(router);

  router.get('/posts/*', (req, res) => {
    const name = util.stripExtname(req.params[0]);
    const file = path.resolve(dirname, '_posts', `${name}.md`);
    util.renderPost(dirname, file, html => {
      res.header('Content-Type', 'text/html; charset=utf-8');
      res.end(html);
    });
  });

  router.get('/', (req, res) => {
    const html = util.renderIndex(dirname);
    res.end(html);
  });

  app.listen(port, () => {
    console.log(`Server is listening on ${host}:${port}`);
    open(`${host}:${port}`);
  });
};
