// build-pages.mjs — rename game.html to index.html for GitHub Pages root serving
import { copyFileSync, existsSync } from 'fs';

const src = 'game.html';
const dst = 'index.html';

if (existsSync(src)) {
  copyFileSync(src, dst);
  console.log('Copied game.html -> index.html');
} else {
  console.error('game.html not found — nothing to do');
  process.exit(1);
}
