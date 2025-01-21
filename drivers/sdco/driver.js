import Homey from 'homey';

class SDCODriver extends Homey.Driver {
  async onInit() {
    this.log('SDCO Driver has been initialized');
  }

  async onPairListDevices() {
    return [
      {
        name: 'SDCO Device',
        data: {
          id: 'unique-device-id',
        },
      },
    ];
  }
}

module.exports = SDCODriver;