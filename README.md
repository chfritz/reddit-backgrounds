# Gnome: Automatically fetch wallpapers from reddit

Simple script that fetches a random, high-rated, lanscape-ish shaped image from a specified reddit (currently hard-coded to "/r/earthporn"), and then sets that as background on Gnome.

![Sample](sample.jpg)

Inspired by [styli.sh](https://github.com/thevinter/styli.sh). What I was missing from styli.sh is the ability to only fetch landscape images. A lot of the images on the reddits I liked were portrait, so no good for a desktop background. This script also avoid duplicates and records a history (in `~/.local/share/reddit-background/history.json`) where you can also get a description of the current image.

The script now also adds the description of the image as a caption onto the image itself.

## Usage:
```
node index.js
```
