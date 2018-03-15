const path = require('path');
const util = require('./util');

module.exports = (dir, options) => {
  const dirname = dir || '.';
  const outputDir = path.resolve(options.output || dirname);

  // 生成文章内容页面
  const sourceDir = path.resolve(dirname, '_posts');
  // console.log('sourceDir: ', sourceDir);
  const postFiles = util.readdirRecursive(sourceDir);
  for (const f of postFiles) {
    const filepath = path.join(sourceDir, f);
    util.renderPost(dirname, filepath, html => {
      // /Users/elsa/workspace/blog-cli/lib/_posts/2018-01-01/hello-world.md
      // 2018-01-01/hello-world.html
      const relativePath = `${util.stripExtname(filepath.slice(sourceDir.length + 1))}.html`;
      const file = path.resolve(outputDir, 'posts', relativePath);
      console.log('filefilefilefile: ', file);
      util.outputFile(file, html);
    });
  }

  // 生成首页
  const htmlIndex = util.renderIndex(dirname);
  const fileIndex = path.resolve(outputDir, 'index.html');
  util.outputFile(fileIndex, htmlIndex);
};
