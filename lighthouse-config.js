module.exports = {
  extends: 'lighthouse:default',
  settings: {
    onlyCategories: ['performance', 'best-practices', 'accessibility', 'seo'],
    formFactor: 'desktop',
    screenEmulation: {
      mobile: false,
      width: 1366,
      height: 768,
      deviceScaleFactor: 1,
      disabled: false,
    },
    emulatedUserAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  },
};
