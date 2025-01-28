const { ZwaveDevice } = require("homey-zwavedriver");

class SDCO1Device extends ZwaveDevice {
  async onNodeInit() {
    this.log("SDCO1Device initializing...");

    try {
      // Sjekk om capabilities er tilgjengelige
      const capabilities = await this.getCapabilities();
      this.log("Available capabilities:", capabilities);

      // Temperatur
      if (capabilities.includes("measure_temperature")) {
        this.registerCapability("measure_temperature", "SENSOR_MULTILEVEL", {
          getOpts: {
            getOnStart: true,
          },
          reportParser: (report) => {
            if (report && report["Sensor Type"] === "Temperature (version 1)") {
              const value = report["Sensor Value (Parsed)"];
              this.log("Temperature value:", value);
              return value;
            }
            return null;
          },
        });
      } else {
        this.error("measure_temperature capability not available");
      }

      // Luftfuktighet
      if (capabilities.includes("measure_humidity")) {
        this.registerCapability("measure_humidity", "SENSOR_MULTILEVEL", {
          getOpts: {
            getOnStart: true,
          },
          reportParser: (report) => {
            if (
              report &&
              report["Sensor Type"] === "Relative humidity (version 2)"
            ) {
              const value = report["Sensor Value (Parsed)"];
              this.log("Humidity value:", value);
              return value;
            }
            return null;
          },
        });
      } else {
        this.error("measure_humidity capability not available");
      }

      // Batteri
      if (capabilities.includes("measure_battery")) {
        this.registerCapability("measure_battery", "BATTERY", {
          getOpts: {
            getOnStart: true,
          },
        });
      } else {
        this.error("measure_battery capability not available");
      }

      // Alarmer
      // Smoke alarm
      if (capabilities.includes("alarm_smoke")) {
        this.registerCapability("alarm_smoke", "NOTIFICATION", {
          getOpts: {
            getOnStart: true,
          },
          reportParser: (report) => {
            console.log("Notification report", report);

            if (!report || report["Notification Type"] !== "Smoke") return null;

            var eventType = report["Event"];
            if (eventType === 1 || eventType === 3) {
              console.log("Smoke alarm");
              return true;
            }

            return false;
          },
        });
      }

      // Heat alarm
      if (capabilities.includes("alarm_heat")) {
        this.registerCapability("alarm_heat", "NOTIFICATION", {
          getOpts: {
            getOnStart: true,
          },
          reportParser: (report) => {
            if (report && report["Notification Type"] === 0x04) {
              // Heat is type 0x04
              // Event 0x02 means heat detected, 0x00 means idle/restore
              const alarmActive = report["Event"] === 0x02;
              this.log("Heat alarm status:", alarmActive);
              return alarmActive;
            }
            return false;
          },
        });
      }

      // Tamper alarm
      if (capabilities.includes("alarm_tamper")) {
        this.registerCapability("alarm_tamper", "NOTIFICATION", {
          getOpts: {
            getOnStart: true,
          },
          reportParser: (report) => {
            if (!report || report["Notification Type"] !== "Home Security")
              return null;

            // Fra dokumentasjonen:
            // Tamper Open : 00 00 00 07 03 00
            // Tamper Close: 00 00 00 07 00 01 03
            switch (report["Event"]) {
              case 3: // Tamper åpen
                // console.log('Tamper detected: Device removed from mounting bracket');
                return true;

              case 0: // Tamper lukket
                // console.log('Tamper restored: Device mounted properly');
                return false;
            }

            return null;
          },
        });
      }

      // CO alarm (your existing code with fix)
      if (capabilities.includes("alarm_co")) {
        this.registerCapability("alarm_co", "NOTIFICATION", {
          getOpts: {
            getOnStart: true,
          },
          reportParser: (report) => {
            if (report && report["Notification Type"] === 0x02) {
              // CO is type 0x02
              // Event 0x02 means CO detected, 0x00 means idle/restore
              const alarmActive = report["Event"] === 0x02;
              this.log("CO alarm status:", alarmActive);
              return alarmActive;
            }
            return false;
          },
        });
      }


      // Debug logging for alle rapporter
      // this.registerReportListener('SENSOR_MULTILEVEL', 'SENSOR_MULTILEVEL_REPORT', report => {
      //   this.log('Raw SENSOR_MULTILEVEL_REPORT:', JSON.stringify(report, null, 2));
      // });

      // this.registerReportListener('BATTERY', 'BATTERY_REPORT', report => {
      //   this.log('Raw BATTERY_REPORT:', JSON.stringify(report, null, 2));
      // });

      // Heat alarm test funksjonalitet
    } catch (err) {
      this.error("Error during initialization:", err);
    }
  }
}

module.exports = SDCO1Device;
