#!/bin/bash
# Install Alacritty config for Linux
mkdir -p ~/.config/alacritty
cp alacritty-linux.toml ~/.config/alacritty/alacritty.toml

# Install themes
if [ ! -d ~/.config/alacritty/themes ]; then
  git clone https://github.com/alacritty/alacritty-theme ~/.config/alacritty/themes
fi

echo "Alacritty config installed!"
