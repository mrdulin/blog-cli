const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const MarkdownIt = require('markdown-it');
const fse = require('fs-extra');

/**
 * 读取配置文件
 *
 * @author dulin
 * @param {any} dir
 * @returns  json格式的配置文件
 */
function loadConfig(dir) {
  const p = path.resolve(dir, 'config.json');
  const content = fs.readFileSync(p).toString();
  const json = JSON.parse(content);
  return json;
}

const md = new MarkdownIt({
  html: true,
  langPrefix: 'code-'
});

function stripExtname(name) {
  let i = 0 - path.extname(name).length;
  if (i === 0) i = name.length;
  return name.slice(0, i);
}

// /Users/elsa/workspace/blog-cli/lib/_posts/2018-01-01/hello-world.md
// 2018-01-01/hello-world

// const fp = path.resolve('.', '_posts', '2018-01-01/hello-world.md');
// const sd = path.resolve('.', '_posts');
// console.log('fp: ', fp);
// console.log(stripExtname(fp.slice(sd.length + 1)));

/**
 * markdown文本字符串转换为html文本字符串
 *
 * @author dulin
 * @param {any} content markdown文本字符串
 * @returns html文本字符串
 */
function markdownToHtml(content) {
  return md.render(content || '');
}

/**
 * 将ejs模版和数据绑定渲染
 *
 * @author dulin
 * @param {any} file ejs模版文件的文件路径
 * @param {any} data 要渲染的到模版中的数据
 * @returns  html字符串
 */
function renderFile(file, data) {
  const template = fs.readFileSync(file).toString();
  return ejs.render(template, data);
}

// const mockContent = fs.readFileSync('__test__/test.md');
/**
 * 解析元数据
 *
 * @author dulin
 * @param {any} data
 * @returns
 */
function parseSourceContent(data) {
  const info = {};
  let source = '';
  const split = '---\n';
  const i = data.indexOf(split);
  if (i !== -1) {
    const j = data.indexOf(split, i + split.length);
    if (j !== -1) {
      const str = data.slice(i + split.length, j).trim();
      source = data.slice(j + split.length).trim();
      // console.log(i, j, str);
      str.split('\n').reduce((pre, cur) => {
        const [key, value] = cur.split(':');
        pre[key] = value; // eslint-disable-line no-param-reassign
        return pre;
      }, info);
    }
  }
  info.source = source;
  return info;
}

// console.log(parseSourceContent(mockContent.toString()));

function noDotFiles(x) {
  return x[0] !== '.';
}

/**
 * 递归遍历文件目录，返回通过指定filter的文件路径
 *
 * @author dulin
 * @param {any} root
 * @param {any} [filter=noDotFiles]
 * @param {any} [files=[]]
 * @param {string} [prefix='']
 * @returns
 */
function readdirRecursive(root, filter = noDotFiles, files = [], prefix = '') {
  const dir = path.join(root, prefix);
  if (!fs.existsSync(dir)) return files;
  if (fs.statSync(dir).isDirectory()) {
    fs
      .readdirSync(dir)
      .filter((name, index) => {
        return filter(name, index, dir);
      })
      .forEach(name => {
        readdirRecursive(root, filter, files, path.join(prefix, name));
      });
  } else {
    files.push(prefix);
  }

  return files;
}

// console.log(readdirRecursive(path.resolve(__dirname, '../_posts')));

/**
 * 渲染文章
 *
 * @author dulin
 * @param {any} dir 文章目录
 * @param {any} file 文章路径
 * @param {function} callback 读取文章的回调函数
 */
function renderPost(dir, file, callback) {
  fs.readFile(file, (err, content) => {
    if (err) throw err;
    const post = parseSourceContent(content.toString());
    post.content = markdownToHtml(post.source);
    post.layout = post.layout || 'post';
    const layoutFilepath = path.resolve(dir, '_layout', `${post.layout}.html`);
    const config = loadConfig(dir);
    const html = renderFile(layoutFilepath, { post, config });
    callback(html);
  });
}

/**
 * 渲染文章列表
 *
 * @author dulin
 * @param {any} dir 文章目录
 * @returns {string} html 文章列表html
 */
function renderIndex(dir) {
  const posts = [];
  const sourceDir = path.resolve(dir, '_posts');
  const postFiles = readdirRecursive(sourceDir);
  // console.log(postFiles);
  for (const f of postFiles) {
    const source = fs.readFileSync(path.join(sourceDir, f)).toString();
    const post = parseSourceContent(source);
    post.timestamp = new Date(post.date).getTime();
    post.url = `/posts/${stripExtname(f)}.html`;
    posts.push(post);
  }
  posts.sort((a, b) => {
    return b.timestamp - a.timestamp;
  });
  const config = loadConfig(dir);
  const layoutFilepath = path.resolve(dir, '_layout', 'index.html');
  const html = renderFile(layoutFilepath, { posts, config });
  return html;
}

function outputFile(file, content) {
  console.log('生成页面 %s', file);
  fse.outputFileSync(file, content);
}

module.exports = {
  parseSourceContent,
  readdirRecursive,
  renderPost,
  stripExtname,
  markdownToHtml,
  renderFile,
  renderIndex,
  outputFile,
  loadConfig
};
