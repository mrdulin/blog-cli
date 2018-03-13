const fs = require('fs');
const path = require('path');

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

module.exports = {
  parseSourceContent,
  readdirRecursive
};
