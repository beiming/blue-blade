import path from "path";
import glob from "glob";

const appName = 'app';
const CONFIG = {
  isProd: process.env.NODE_ENV === 'production',
  paths: {
    src: file => path.join('./', file || ''),
    dist: file => path.join('..', appName, 'static', file || '')
  }
};

function makeEntries() {
  const src = `./${CONFIG.paths.src('js')}/`;
  const entries = {};
  glob.sync(path.join(src, '**/main.js'))
    .map(file => `./${file}`)
    .forEach(file => {
      let name = path.dirname(file);
      name = name.substr(name.lastIndexOf('/') + 1);
      entries[name] = file;
    });
  return entries;
}

export {CONFIG, makeEntries};