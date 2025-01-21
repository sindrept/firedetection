// app.js
'use strict';

const Homey = require('homey');

class MySDCOApp extends Homey.App {
  async onInit() {
    this.log('SDCO App is running...');
  }
}

module.exports = MySDCOApp;