//https://www.webpackjs.com/guides/getting-started/
////http://www.ruanyifeng.com/blog/2016/10/npm_scripts.html
import _ from 'lodash';
import './style.css';
import printMe from './print.js';

function component() {
    var element = document.createElement('div');
    var btn = document.createElement('button');

    // Lodash（目前通过一个 script 脚本引入）对于执行这一行是必需的
    element.innerHTML = _.join(['Hello', 'webpack', 'npm run build'], ' ');
    element.classList.add('hello');  

    btn.innerHTML = 'Click me and check the console!';
    btn.onclick = printMe;
    element.appendChild(btn);
    
    return element;
  }
  
  document.body.appendChild(component());