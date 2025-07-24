"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserPerformance = void 0;
var mongoose_1 = require("mongoose");
var VarkPerformanceSchema = new mongoose_1.Schema({
    countResponse: { type: Number, default: 0 },
    countNegativeResponse: { type: Number, default: 0 },
}, { _id: false });
var UserPerformanceSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    visual: { type: VarkPerformanceSchema, default: function () { return ({}); } },
    auditory: { type: VarkPerformanceSchema, default: function () { return ({}); } },
    reading: { type: VarkPerformanceSchema, default: function () { return ({}); } },
    kinesthetic: { type: VarkPerformanceSchema, default: function () { return ({}); } },
});
exports.UserPerformance = mongoose_1.default.model('UserPerformance', UserPerformanceSchema);
