"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
var mongoose_1 = require("mongoose");
var userSchema = new mongoose_1.Schema({
    uid: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    settings: {
        bionicReading: { type: Boolean, default: false },
        font: { type: String, enum: ['default', 'OpenDyslexic'], default: 'default' },
        spacing: { type: String, enum: ['default', 'medium', 'large'], default: 'default' },
        chunking: { type: Boolean, default: false },
    },
}, { timestamps: true });
exports.User = (0, mongoose_1.model)('User', userSchema);
