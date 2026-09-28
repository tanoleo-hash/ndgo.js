class NDgoConverter {
  
  // ==========================================
  // ၁။ NDgo စာသား -> JSON String သို့ ပြောင်းခြင်း
  // ==========================================
  static ndgoToJson(ndgoText, pretty = true) {
    const jsObj = NDgoConverter.ndgoToObj(ndgoText);
    return JSON.stringify(jsObj, null, pretty ? 2 : 0);
  }

  // NDgo စာသား -> JS Object သို့ ပြောင်းလဲပေးသည့် Parser
  static ndgoToObj(text) {
    const result = {};
    const lines = text.split('\n');
    let currentGroupPath = [];

    for (let line of lines) {
      line = line.trim();

      // Comment သို့မဟုတ် လိုင်းအလွတ်များကို ကျော်မည်
      if (!line || line.startsWith('#') || line.startsWith('//')) continue;

      // Group / Sub group ဖန်တီးခြင်း
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

      // set = A, B, C (List)
      if (line.startsWith('set =')) {
        const values = line.split('=')[1].split(',').map(v => v.trim());
        this._setValue(result, currentGroupPath, 'members', values);
        continue;
      }

      // Key = Value
      if (line.includes('=')) {
        const [key, val] = line.split('=').map(s => s.trim());
        this._setValue(result, currentGroupPath, key, this._parseValue(val));
      }
    }

    return result;
  }

  // ==========================================
  // ၂။ JSON String -> NDgo Format သို့ ပြောင်းခြင်း
  // ==========================================
  static jsonToNdgo(jsonInput) {
    const obj = typeof jsonInput === 'string' ? JSON.parse(jsonInput) : jsonInput;
    let lines = ['# Converted from JSON to NDgo Format\n'];

    function buildNdgo(currentObj, path = []) {
      const keys = Object.keys(currentObj);
      const primitives = [];
      const objects = [];

      for (const key of keys) {
        const val = currentObj[key];
        if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
          objects.push({ key, val });
        } else {
          primitives.push({ key, val });
        }
      }

      // Root မဟုတ်သော Group များအတွက် Path ရေးသားခြင်း
      if (path.length > 0 && primitives.length > 0) {
        lines.push(`create group = ${path.join(' > ')}`);
      }

      // Key-Value များနှင့် Array များ ထည့်သွင်းခြင်း
      for (const { key, val } of primitives) {
        if (key === 'members' && Array.isArray(val)) {
          lines.push(`set = ${val.join(', ')}`);
        } else if (Array.isArray(val)) {
          lines.push(`${key} = ${val.join(', ')}`);
        } else {
          let displayVal = val;
          if (val === true) displayVal = 'yes';
          if (val === false) displayVal = 'no';
          lines.push(`${key} = ${displayVal}`);
        }
      }

      if (primitives.length > 0) lines.push(''); // လိုင်းအလွတ်ခြားခြင်း

      // Nested Object များကို Recursive လှည့်ခြင်း
      for (const { key, val } of objects) {
        buildNdgo(val, [...path, key]);
      }
    }

    buildNdgo(obj);
    return lines.join('\n').trim();
  }

  // Helper Functions
  static _parseValue(val) {
    if (val.toLowerCase() === 'yes' || val.toLowerCase() === 'true') return true;
    if (val.toLowerCase() === 'no' || val.toLowerCase() === 'false') return false;
    if (!isNaN(val) && val !== '') return Number(val);
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
