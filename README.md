# NDgo.js 🚀

**Next Data Go** - A lightweight, human-friendly data notation library for JavaScript without setup or dependencies.

---

## ✨ Features

- **No Quotes Required:** Keys and strings do not need double quotes.
- **Comments Supported:** Add comments easily using `#` or `//`.
- **Flexible Syntax:** No strict commas or brackets needed.
- **Zero Dependencies:** Runs directly in the browser via CDN or local JS script.
- **Bidirectional Converter:** Convert between NDgo format and standard JSON seamlessly.

## 📦 Quick Start (CDN)

Include `ndgo.js` directly in your HTML file without running `npm install`:

```
<script src="https://cdn.jsdelivr.net/gh/your-username/ndgo@main/ndgo.js"></script>
```

## 💡 Usage Example

```
<script>
  const text = `
    # NDgo Data Example
    create group = School > Student
    set = Su Su, Aung Aung
    total = 200
    is active = yes
  `;

  // Parse NDgo text to JavaScript Object
  const data = NDgo.parse(text);
  console.log(data);
</script>
```

## 📊 Syntax Comparison

| Feature | JSON | NDgo |
| --- | --- | --- |
| Comments | ❌ No | ✅ Yes (#) |
| Quotes Required | ✅ Yes ("key") | ❌ No |
| Commas Required | ✅ Yes | ❌ No |
| Group Syntax | Nested Brackets {} | Path Operator (create group = A > B) |

## 📄 License

Apache 2.0 License © 2026 NDgo Project
