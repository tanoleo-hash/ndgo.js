// ndgo.js - Zero Dependency, Pure JS NDgo Parser
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.NDgo = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

  class NDgo {
    static parse(text) {
      const result = {};
      const lines = text.split('\n');
      let currentGroupPath = [];

      for (let line of lines) {
        line = line.trim();

        if (!line || line.startsWith('#')) continue;

        if (line.startsWith('create group =') || line.startsWith('create sub group =')) {
          const pathStr = line.split('=')[1].trim();
          const parts = pathStr.split('>').map(p => p.trim());
          
          if (line.startsWith('create group =')) {
            currentGroupPath = parts;
          } else {
            currentGroupPath = [...currentGroupPath, ...parts];
          }

          this._ensurePath(result, currentGroupPath);
          continue;
        }

        if (line.startsWith('set =')) {
          const values = line.split('=')[1].split(',').map(v => v.trim());
          this._setValue(result, currentGroupPath, 'members', values);
          continue;
        }

        if (line.includes('=')) {
          const [key, val] = line.split('=').map(s => s.trim());
          this._setValue(result, currentGroupPath, key, this._parseValue(val));
        }
      }

      return result;
    }

    static _parseValue(val) {
      if (val.toLowerCase() === 'yes' || val.toLowerCase() === 'true') return true;
      if (val.toLowerCase() === 'no' || val.toLowerCase() === 'false') return false;
      if (!isNaN(val)) return Number(val);
      return val;
    }

    static _ensurePath(obj, path) {
      let curr = obj;
      for (const key of path) {
        if (!curr[key]) curr[key] = {};
        curr = curr[key];
      }
    }

    static _setValue(obj, path, key, value) {
      let curr = obj;
      for (const p of path) {
        if (!curr[p]) curr[p] = {};
        curr = curr[p];
      }
      curr[key] = value;
    }
  }

  return NDgo;
}));
