const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const icons = ['sound', 'mute', 'play', 'pause'];

icons.forEach(icon => {
  sharp(path.join(__dirname, `../assets/icons/${icon}.svg`))
    .png()
    .toFile(path.join(__dirname, `../assets/icons/${icon}.png`))
    .catch(err => console.error(`Error converting ${icon}.svg:`, err));
}); 