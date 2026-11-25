const fs = require('fs');
const css = fs.readFileSync('src/app/globals.css', 'utf8');

const themes = [
  'royal', 'nordic-slate', 'ember-tide', 'abstract', 'arcade-overdrive',
  'verdant', 'lime-ivory', 'jungle-nebula', 'ocean-dark', 'terminal', 'gen-z'
];

themes.forEach(t => {
  ['dark', 'light'].forEach(m => {
    const reg = new RegExp(`html\\[data-theme="${t}"\\]\\[data-mode="${m}"\\]\\s*\\{([^}]+)\\}`);
    const match = css.match(reg);
    if (match) {
      const block = match[1];
      const getV = (v) => {
        const m2 = block.match(new RegExp(`${v}\\s*:\\s*([^;]+);`));
        return m2 ? m2[1].trim() : '-';
      };
      console.log(`${t} [${m}]: bg=${getV('--color-bg-main')}, card=${getV('--color-bg-card')}, prim=${getV('--color-primary')}, sec=${getV('--color-secondary')}`);
    } else {
      console.log(`${t} [${m}]: NOT FOUND`);
    }
  });
});
