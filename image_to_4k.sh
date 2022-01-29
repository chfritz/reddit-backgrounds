#!/bin/bash

# Convert given image file to landscape, adding blur on the sides as needed
# from https://graphicdesign.stackexchange.com/a/89934/171792

RES="3840x2160"

# convert -size $RES xc:skyblue \
#         in.jpg -geometry $RES -blur 0x25 -gravity northwest -composite \
#         in.jpg -geometry $RES -blur 0x25 -gravity southeast -composite \
#         in.jpg -geometry $RES -gravity center -composite \
#         out.jpg

# convert -size $RES xc:skyblue \
# in.jpg -geometry $RES -scale 10% -blur 0x5 -resize 1000% -gravity northwest -composite \
# in.jpg -geometry $RES -scale 10% -blur 0x5 -resize 1000% -gravity southeast -composite \
# in.jpg -geometry $RES -gravity center -composite \
# out.jpg

convert $1 -geometry $RES -scale 10% -blur 0x5 -resize 1000% tmp.jpg
sleep 1
convert -size $RES xc:skyblue \
tmp.jpg -gravity northwest -composite \
tmp.jpg -gravity southeast -composite \
$1 -geometry $RES -gravity center -composite \
$2
sleep 1
