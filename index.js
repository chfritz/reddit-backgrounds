#!/usr/bin/node

const fetch = require('node-fetch');
const fs = require('fs');
const https = require('https');
const execSync = require('child_process').execSync;

SUBREDDIT=process.argv[2] || 'earthporn';
URL=`https://www.reddit.com/r/${SUBREDDIT}/top/.json?raw_json=1&t=day`;
FILE='/tmp/reddit-background.jpg'

DIR=`${process.env.HOME}/.local/share/reddit-backgrounds/`;
HISTORY_FILE=`${DIR}/history.json`
fs.mkdirSync(DIR, {recursive: true});
let history;
try {
  history = JSON.parse(fs.readFileSync(HISTORY_FILE).toString());
} catch (e) {
  history = {};
}

/** calculate probability weight to give to picking an image */
const weighting = ({title, ups, downs, width, height}) =>
  width < height // don't want any portrait shaped ones
    || history[title] // or repeats
    || width < 1200 // or low res
  ? 0 :
  (ups/(downs+1))/10 + // want those with high up-ratio
    (width/height)*30; // and as wide as possible

const run = async () => {
  const response = await fetch(URL);
  const body = await response.json();

  let weightSum = 0;
  const images = body.data.children.map(({data}) => {
    const image = {
      title: data.title,
      image: data.preview.images[0].source.url,
      width: data.preview.images[0].source.width,
      height: data.preview.images[0].source.height,
      ups: data.ups,
      downs: data.downs,
    };
    image.weight = weighting(image);
    weightSum += image.weight;
    return image;
  });

  // now randomly pick from images, weighted by their probability weight
  const r = Math.random();
  let i = 0;
  for (let probMass = 0; probMass < r * weightSum; i++) {
    probMass += images[i].weight;
  }

  const chosen = images[i-1];
  console.log(chosen);

  const file = fs.createWriteStream(FILE);
  // use a new filename each time as not to crash gnome-shell when overwriting
  // current background image
  const annotatedFile = `${FILE}_text-${(new Date()).toISOString()}.jpg`;
  const request = https.get(chosen.image, response => {
    response.pipe(file);
    file.on('finish', () => {
      const desc = chosen.title.match(/^[^\[]*/)[0];
      // extend to 4k and add text
      const stdout = execSync(`${__dirname}/image_to_4k.sh "${FILE}" "${annotatedFile}" "${desc}"`).toString();
      console.log('output from scaling:', stdout);

      const output =
        execSync(`${__dirname}/set_gnome_wallpaper.sh "${annotatedFile}"`);
      console.log('set_gnome_wallpaper output:', output.toString());

      chosen.lastUsed = new Date();
      history[chosen.title] = chosen;
      fs.writeFileSync(HISTORY_FILE, JSON.stringify(history));

      // so that our "collection" script can pick it up if needed
      const copy = `${FILE}_text.jpg`;
      fs.copyFile(annotatedFile, copy, console.log);
    });
  });
};

run();
