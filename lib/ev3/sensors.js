var util = require("util");
var events = require("events");

var sensor_types = {
  IR: "21",
  TOUCH: "10",
  COLOR: "1d",
  ULTRASONIC: 0,
  GYRO: 0
}






var Sensor = function(adapter, input_port){
  events.EventEmitter.call(this);

  this.adapter = adapter;
  this.input_port = input_port; // a number 1-4
  this.mode = 0;
  this.type_bit = 0;
}

util.inherits(Sensor, events.EventEmitter);

Sensor.prototype.read = function(cb){
  var self = this;
  var counter = this.adapter.readSensor(this.input_port, this.mode, this.type_bit, function(err, packet){
    self._processSensorCallback(err, packet, cb);
  });
}

Sensor.prototype._processSensorCallback = function(err, packet, cb){
  cb(err, packet);
}







var ColorSensor = function(adapter, input_port, mode){
  Sensor.apply(this, arguments);
  this.type_bit = "1d";
  this.mode = mode || ColorSensor.modes.COLOR;
}

util.inherits(ColorSensor, Sensor);

ColorSensor.modes = {
  RINTENSITY: 0,
  AINTENSITY: 1,
  COLOR: 2
};

ColorSensor.colors = {
  NULL: "00",
  BLACK: "0c",
  BLUE: "19",
  GREEN: "25",
  YELLOW: "32",
  RED: "3e",
  WHITE: "4b",
  BROWN: "57"
}

ColorSensor.prototype._processSensorCallback = function(err, packet, cb){
  if(err) return cb(err);

  var payload = packet.substr(10,2);

  //if mode is light intensity, change the result to numeric value
  if(this.mode == ColorSensor.modes.RINTENSITY || this.mode == ColorSensor.modes.AINTENSITY){
    payload = parseInt(payload,16);
  }

  cb(null, payload); //payload will be a ColorSensor.colors constant
}







var TouchSensor = function(adapter, input_port){
  Sensor.apply(this, arguments);
  this.type_bit = "10";
}

util.inherits(TouchSensor, Sensor);

TouchSensor.prototype._processSensorCallback = function(err, packet, cb){
  if(err) return cb(err);

  var payload = packet.substr(10,2);
  var result = false;
  if(payload == "00") { result = false; } else if(payload == "64") { result=true; }

  cb(null, result);
}







var InfraSensor = function(adapter, input_port){
  Sensor.apply(this, arguments);
  this.type_bit = "00";
}

util.inherits(InfraSensor, Sensor);

InfraSensor.prototype._processSensorCallback = function(err, packet, cb){
  if(err) return cb(err);

  var payload = packet.substr(10,2);
  var result = parseInt(payload, 16);

  cb(null, result);
}







module.exports = {
  'ColorSensor': ColorSensor,
  'TouchSensor': TouchSensor,
  'InfraSensor': InfraSensor
}