"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Session = void 0;
var mongoose_1 = require("mongoose");
var sessionSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    canvasState: { type: mongoose_1.Schema.Types.Mixed },
    currentMode: { type: String, enum: ['V', 'A', 'R', 'K'], default: 'R' },
    kinestheticData: { type: mongoose_1.Schema.Types.Mixed },
}, {
    timestamps: true
});
exports.Session = (0, mongoose_1.model)('Session', sessionSchema);
