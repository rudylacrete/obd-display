const OBDReader = require('bluetooth-obd');
const { EventEmitter } = require('events');
const btOBDReader = new OBDReader();

const obdEventBus = new EventEmitter();

const ELM327_ADDR = '88:18:56:68:98:EB';
const CHANNEL = 1;

btOBDReader.on('debug', console.log);
btOBDReader.on('error', console.error);
btOBDReader.on('connected', function() {
  console.log('OBD found!!!!');
  this.addPoller("rpm");
  this.addPoller("temp");
  this.addPoller("load_pct");
  this.addPoller("sparkadv");

  this.startPolling(200); //Request all values each second.
});

btOBDReader.on('dataReceived', function (data) {
  console.log(data);
  if(data.name && data.value) {
    obdEventBus.emit(data.name, data.value);
    obdEventBus.emit('data', data);
  }
});

// Use first device with 'obd' in the name
// btOBDReader.autoconnect('obd');
btOBDReader.connect(ELM327_ADDR, CHANNEL);

module.exports = obdEventBus;