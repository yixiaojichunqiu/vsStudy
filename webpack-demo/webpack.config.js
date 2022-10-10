const path = require('path');

module.exports = {
  entry: {
      print: './src/print.js'
   },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
    test: /\.css$/,
    use: [
      'style-loader',
      'css-loader'
       ]
     }
   ]
  }
};
//正则/ /
//转义字符\ 结束$
//上面匹配.css结束的
//控制台
//var a = /\.css$/
//a.test("a.css")
//true
//a.test("baa")
//false
//测试符合正则不
//用正则查找 search
