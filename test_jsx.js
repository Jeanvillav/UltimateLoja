const fs = require('fs');
const content = fs.readFileSync('app/admin/page.js', 'utf-8');

let tags = [];
let regex = /<\/?([a-zA-Z0-9]+)[^>]*>/g;
let match;

while ((match = regex.exec(content)) !== null) {
  let tag = match[1];
  let fullTag = match[0];
  
  if (fullTag.endsWith('/>')) continue; // self closing
  
  if (fullTag.startsWith('</')) {
    let last = tags.pop();
    if (last !== tag) {
      console.log(`Mismatch at index ${match.index}: expected </${last}> but found ${fullTag}`);
      break;
    }
  } else if (fullTag.startsWith('<')) {
    tags.push(tag);
  }
}
console.log("Remaining unclosed tags:", tags);
