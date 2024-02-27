module.exports = {
  transpileDependencies: [
    "vuetify",
    "vue-tel-input-vuetify"
  ],
  pwa: {
    name: "LC Host",
    appleMobileWebAppStatusBarStyle: 'white',
    themeColor: "#1976D2",
    msTileColor: "#ffffff",
    manifestOptions: {
      start_url: '/',
      scope: '/'
    },
    workboxOptions: {
      // navigateFallback: '/index.html',
    },
  }
};