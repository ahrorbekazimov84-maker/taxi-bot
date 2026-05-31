const appJson = require('./app.json');

module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...appJson.expo.extra,
    API_URL: process.env.API_URL || 'https://taxi-backend.onrender.com/api',
  },
});
