import fs from 'fs';
const text = fs.readFileSync('temp.jsx', 'utf8');

let level = 0;
let lines = text.split('\n');
for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  let open = (line.match(/<div/g) || []).length;
  let close = (line.match(/<\/div/g) || []).length;
  level += (open - close);
  console.log(`Line ${i + 377}: level ${level} (opened ${open}, closed ${close})`);
}
