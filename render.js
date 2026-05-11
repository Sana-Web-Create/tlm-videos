const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const puppeteer = require('puppeteer');

const args = process.argv.slice(2);
const configFlagIndex = args.indexOf('--config');

if (configFlagIndex === -1 || !args[configFlagIndex + 1]) {
  console.error('Usage: node render.js --config <path-to-config.json>');
  process.exit(1);
}

const configPath = path.resolve(args[configFlagIndex + 1]);
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const TEMPLATE_DIR = path.resolve(__dirname, 'templates', config.template);
const TEMPLATE_HTML = path.join(TEMPLATE_DIR, 'index.html');
const FRAMES_DIR = path.resolve(__dirname, 'frames');
const OUTPUT_DIR = path.resolve(__dirname, 'output');
const OUTPUT_FILE = path.join(OUTPUT_DIR, path.basename(configPath, '.json') + '.mp4');

const FPS = 30;
const TOTAL_FRAMES = config.duration * FPS;

async function render() {
  console.log(`Template : ${config.template}`);
  console.log(`Config   : ${configPath}`);
  console.log(`Duration : ${config.duration}s  (${TOTAL_FRAMES} frames @ ${FPS}fps)`);
  console.log(`Output   : ${OUTPUT_FILE}`);

  fs.mkdirSync(FRAMES_DIR, { recursive: true });
  fs.mkdirSync(OUTPUT_DIR,  { recursive: true });

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });

  // Inject CONFIG before any page script runs
  await page.evaluateOnNewDocument((cfg) => {
    window.CONFIG = cfg;
  }, config);

  await page.goto('file://' + TEMPLATE_HTML, { waitUntil: 'networkidle0' });

  console.log('Capturing frames…');

  for (let f = 0; f < TOTAL_FRAMES; f++) {
    await page.evaluate((frameNumber, totalFrames) => {
      window.tickFrame(frameNumber, totalFrames);
    }, f, TOTAL_FRAMES);

    const framePath = path.join(FRAMES_DIR, `frame_${String(f).padStart(4, '0')}.png`);
    await page.screenshot({ path: framePath, type: 'png' });

    if (f % FPS === 0) process.stdout.write(`  ${f / FPS}s / ${config.duration}s\r`);
  }

  console.log('\nFrames captured. Running FFmpeg…');
  await browser.close();

  execSync(
    `ffmpeg -y -framerate ${FPS} ` +
    `-i "${path.join(FRAMES_DIR, 'frame_%04d.png')}" ` +
    `-c:v libx264 -pix_fmt yuv420p -crf 18 ` +
    `-vf "scale=1080:1920" ` +
    `"${OUTPUT_FILE}"`,
    { stdio: 'inherit' }
  );

  fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
  console.log(`Done → ${OUTPUT_FILE}`);
}

render().catch((err) => {
  console.error(err);
  process.exit(1);
});
