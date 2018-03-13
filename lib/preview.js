const express = require('express');
const path = require('path');
const fs = require('fs');
const MarkdownIt = require('markdown-it');
const ejs = require('ejs');

const util = require('./util');

const md = new MarkdownIt({
  html: true,
  langPrefix: 'code-'
});
const port = 3000;

function stripExtname(name) {
  let i = 0 - path.extname(name).length;
  if (i === 0) i = name.length;
  return name.slice(0, i);
}

function markdownToHtml(content) {
  return md.render(content || '');
}

function renderFile(file, data) {
  const template = fs.readFileSync(file).toString();
  return ejs.render(template, data);
}

module.exports = dir => {
  const dirname = dir || '.';

  const app = express();
  const router = express.Router();

  app.use('/assets', express.static(path.resolve(dirname, 'assets')));
  app.use(router);

  router.get('/posts/*', (req, res) => {
    const name = stripExtname(req.params[0]);
    const file = path.resolve(dirname, '_posts', `${name}.md`);
    fs.readFile(file, (err, content) => {
      if (err) throw err;
      const post = util.parseSourceContent(content.toString());
      post.content = markdownToHtml(post.source);
      post.layout = post.layout || 'post';
      const layoutFilepath = path.resolve(dirname, '_layout', `${post.layout}.html`);
      const html = renderFile(layoutFilepath, { post });
      res.header('Content-Type', 'text/html; charset=utf-8');
      res.end(html);
    });
  });

  router.get('/', (req, res) => {
    const list = [];
    const sourceDir = path.resolve(dirname, '_posts');
    const postFiles = util.readdirRecursive(sourceDir);
    // console.log(postFiles);
    for (const f of postFiles) {
      const source = fs.readFileSync(path.join(sourceDir, f)).toString();
      const post = util.parseSourceContent(source);
      post.timestamp = new Date(post.date).getTime();
      post.url = `/posts/${stripExtname(f)}.html`;
      list.push(post);
      console.log(post);
    }
    list.sort((a, b) => {
      return b.timestamp - a.timestamp;
    });
    const html = renderFile(path.resolve(dirname, '_layout', 'index.html'), { posts: list });
    res.end(html);
  });

  app.listen(port, () => {
    console.log(`Server is listening on http://localhost:${port}`);
  });
};
