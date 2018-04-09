"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _topic = require("./topic");

var _topic2 = _interopRequireDefault(_topic);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class MessageService {

    constructor() {
        this.topics = {};
    }

    createTopic(name, pass) {
        if (!this.topics[name]) {
            this.topics[name] = new _topic2.default(name, pass);
            return true;
        }
        return false;
    }

    getTopic(name) {
        return this.topics[name];
    }

} //      


const MService = new MessageService();
exports.default = MService;