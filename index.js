#!/usr/bin/node

const fetch = require('node-fetch');
const fs = require('fs');
const https = require('https');
const execSync = require('child_process').execSync;

SUBREDDIT='earthporn';
// URL=`https://www.reddit.com/r/${SUBREDDIT}/hot/.json?raw_json=1&t=`;
URL=`https://www.reddit.com/r/${SUBREDDIT}/top/.json?raw_json=1&t=day`;
FILE='/tmp/reddit-background.jpg'

HISTORY_FILE=`${process.env.HOME}/.local/share/reddit-backgrounds/history.json`
const history = JSON.parse(fs.readFileSync(HISTORY_FILE).toString());

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
  // for testing:
  // const response = fs.readFileSync('test.json');
  // const body = JSON.parse(response.toString());

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
  const request = https.get(chosen.image, response => {
    response.pipe(file);
    execSync(`gsettings set org.gnome.desktop.background picture-uri "file://${FILE}"`);
    chosen.lastUsed = new Date();
    history[chosen.title] = chosen;
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history));
  });
};

run();
