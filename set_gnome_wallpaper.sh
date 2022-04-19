#!/bin/bash

# Script to set gnome wallpaper from a cronjob, i.e., without the environment
# set up for the desktop

# From https://stackoverflow.com/questions/10374520/gsettings-with-cron
PID=$(pgrep -U $(id -u) gnome-session | head -n 1)
export DBUS_SESSION_BUS_ADDRESS=$(grep -z DBUS_SESSION_BUS_ADDRESS /proc/$PID/environ|cut -d= -f2-)

echo "setting wallpaper to $1"
echo "using DBUS_SESSION_BUS_ADDRESS: $DBUS_SESSION_BUS_ADDRESS"
gsettings set org.gnome.desktop.background picture-uri "file://$1"
