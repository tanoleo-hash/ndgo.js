// ndgo.js - Zero Dependency, Pure JS NDgo Parser (v1.0.0)
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
    // Value အရေအတွက်အလိုက် အလိုအလျောက် Auto-Map လုပ်ပေးမည့် Default Field များ
    static defaultFields = ['id', 'name', 'role', 'status'];

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
          const values = line.split('=')[1].split(',').map(v => this._parseValue(v.trim()));
          this._setValue(result, currentGroupPath, 'members', values);
          continue;
        }

        if (line.includes('=')) {
          const eqIdx = line.indexOf('=');
          const key = line.slice(0, eqIdx).trim();
          const rawVal = line.slice(eqIdx + 1).trim();

          if (key) {
            // ၁။ Comma ပါဝင်ပါက အလိုအလျောက် Auto Fields Mapping (id, name, role...) ပြုလုပ်ခြင်း
            if (rawVal.includes(',')) {
              const values = rawVal.split(',').map(v => this._parseValue(v.trim()));
              const autoObj = {};
              
              values.forEach((v, index) => {
                const fieldName = this.defaultFields[index] || `field_${index + 1}`;
                autoObj[fieldName] = v;
              });

              this._setValue(result, currentGroupPath, key, autoObj);
            } 
            // ၂။ Key = Value (ဥပမာ user = 6) ဆိုလျှင် { user: { id: 6 } } အဖြစ် Auto Map လုပ်ပေးခြင်း
            else {
              const parsedVal = this._parseValue(rawVal);

              if (typeof parsedVal === 'number') {
                this._setValue(result, currentGroupPath, key, { id: parsedVal });
              } else {
                this._setValue(result, currentGroupPath, key, parsedVal);
              }
            }
          }
        }
      }

      return result;
    }

    static _parseValue(val) {
      if (val.toLowerCase() === 'yes' || val.toLowerCase() === 'true') return true;
      if (val.toLowerCase() === 'no' || val.toLowerCase() === 'false') return false;
      if (val !== '' && !isNaN(val)) return Number(val);
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
