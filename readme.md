# 静态博客命令行生成工具

**说明:**

`package.json`中的`bin`属性用来指定当前模块需要链接的命令，项目指定`blog`命令是执行文件`./bin/blog`。为了让这个设置生效，还需要执行以下命令来进行链接：

```bash
sudo npm link
```

执行成功后，控制台大概会打印这样的内容：

```bash
~/workspace/blog-cli sudo npm link
npm WARN blog-cli@1.0.0 No description
npm WARN blog-cli@1.0.0 No repository field.

up to date in 0.926s
/usr/local/bin/blog -> /usr/local/lib/node_modules/blog-cli/bin/blog
/usr/local/lib/node_modules/blog-cli -> /Users/elsa/workspace/blog-cli
```

现在执行以下命令：

```bash
~/workspace/blog-cli blog help

  Usage: blog [options] [command]

  Options:

    -V, --version  output the version number
    -h, --help     output usage information

  Commands:

    help           显示使用帮助
    create [dir]   创建一个空的博客
```
