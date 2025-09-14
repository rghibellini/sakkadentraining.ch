const COLORFUL_IMAGES = [
    'images/colorful/background1.jpg',
    'images/colorful/background2.jpg',
    'images/colorful/background3.jpg',
    'images/colorful/background4.jpg',
    'images/colorful/background5.jpg',
    'images/colorful/background6.jpg',
    'images/colorful/background7.jpg',
    'images/colorful/background8.jpg',
    'images/colorful/background9.jpg',
    'images/colorful/background10.jpg',
    'images/colorful/background11.jpg',
    'images/colorful/background12.jpg',
    'images/colorful/background13.jpg',
    'images/colorful/background14.jpg',
    'images/colorful/background15.jpg',
    'images/colorful/background16.jpg',
    'images/colorful/background17.jpg',
    'images/colorful/background18.jpg',
    'images/colorful/background19.jpg',
    'images/colorful/background20.jpg',
    'images/colorful/background21.jpg',
    'images/colorful/background22.jpg',
    'images/colorful/background23.jpg',
    'images/colorful/background24.jpg',
    'images/colorful/background25.jpg',
    'images/colorful/background26.jpg',
    'images/colorful/background27.jpg',
    'images/colorful/background28.jpg',
    'images/colorful/background29.jpg',
    'images/colorful/background30.jpg',
    'images/colorful/background31.jpg',
    'images/colorful/background32.jpg',
    'images/colorful/background33.jpg',
    'images/colorful/background34.jpg',
    'images/colorful/background35.jpg',
    'images/colorful/background36.jpg',
    'images/colorful/background37.jpg',
    'images/colorful/background38.jpg',
    'images/colorful/background39.jpg',
    'images/colorful/background40.jpg'
];

const BLACKANDWHITE_IMAGES = [
    'images/blackandwhite/background1.jpg',
    'images/blackandwhite/background2.jpg',
    'images/blackandwhite/background3.jpg',
    'images/blackandwhite/background4.jpg',
    'images/blackandwhite/background5.jpg',
    'images/blackandwhite/background6.jpg',
    'images/blackandwhite/background7.jpg',
    'images/blackandwhite/background8.jpg',
    'images/blackandwhite/background9.jpg',
    'images/blackandwhite/background10.jpg',
    'images/blackandwhite/background11.jpg',
    'images/blackandwhite/background12.jpg',
    'images/blackandwhite/background13.jpg',
    'images/blackandwhite/background14.jpg',
    'images/blackandwhite/background15.jpg',
    'images/blackandwhite/background16.jpg',
    'images/blackandwhite/background17.jpg',
    'images/blackandwhite/background18.jpg',
    'images/blackandwhite/background19.jpg',
    'images/blackandwhite/background20.jpg',
    'images/blackandwhite/background21.jpg',
    'images/blackandwhite/background22.jpg',
    'images/blackandwhite/background23.jpg',
    'images/blackandwhite/background24.jpg',
    'images/blackandwhite/background25.jpg',
    'images/blackandwhite/background26.jpg',
    'images/blackandwhite/background27.jpg',
    'images/blackandwhite/background28.jpg',
    'images/blackandwhite/background29.jpg',
    'images/blackandwhite/background30.jpg',
    'images/blackandwhite/background31.jpg',
    'images/blackandwhite/background32.jpg',
    'images/blackandwhite/background33.jpg',
    'images/blackandwhite/background34.jpg',
    'images/blackandwhite/background35.jpg',
    'images/blackandwhite/background36.jpg',
    'images/blackandwhite/background37.jpg',
    'images/blackandwhite/background38.jpg',
    'images/blackandwhite/background39.jpg',
    'images/blackandwhite/background40.jpg'
];

// 2) Helper function to pick a random item from an array
function getRandomImage(imageArray) {
    const index = Math.floor(Math.random() * imageArray.length);
    return imageArray[index];
  }
  
  export const backgroundModule = {
    setBackground(imageUrl) {
      const backgroundLayer = document.getElementById('backgroundLayer');
      if (backgroundLayer) {
        backgroundLayer.style.backgroundImage = `url(${imageUrl})`;
      }
    },
  
    clearBackground() {
      const backgroundLayer = document.getElementById('backgroundLayer');
      if (backgroundLayer) {
        backgroundLayer.style.backgroundImage = 'none';
      }
    },
  
    // 3) Main function to pick a random background if enabled
    updateBackgroundSettings(modeSettings) {
      if (!modeSettings.background) {
        this.clearBackground();
        return;
      }
  
      // Decide which array to pick from
      let imgArray;
      if (modeSettings.backgroundType === 'blackandwhite') {
        imgArray = BLACKANDWHITE_IMAGES;
      } else {
        // default to colorful if not "blackandwhite"
        imgArray = COLORFUL_IMAGES;
      }
  
      // Choose a random image
      const randomImg = getRandomImage(imgArray);
      // Set that image as background
      this.setBackground(randomImg);
    }
  };