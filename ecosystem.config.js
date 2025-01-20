module.exports = {
    apps: [
      {
        name: 'Trim', // שם האפליקציה
        script: './dist/server.js', // הקובץ הראשי של האפליקציה
        env: {
          NODE_ENV: 'development', // הגדרות לסביבת Development
        },
        env_production: {
          NODE_ENV: 'production', // הגדרות לסביבת Production
        },
      },
    ],
  };