"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createLfo(start) {
    const newLfo = {};
    newLfo.name = "generated";
    newLfo.points = [0, 1, start, 1];
    newLfo.num_points = 2;
    newLfo.powers = [];
    return newLfo;
}
exports.createLfo = createLfo;
function createModulation(target, lfo, end) {
    lfo.points.push(end, 1);
    lfo.num_points++;
    const newMod = {};
    newMod.source = "lfo_1";
    newMod.destination = target;
    newMod.line_mapping = lfo;
    return newMod;
}
exports.createModulation = createModulation;
function applyAmplitude(lfo, start, end, velocity) {
    lfo.points.push(start, 1);
    lfo.points.push(start, 1 - velocity);
    lfo.points.push(end, 1 - velocity);
    lfo.points.push(end, 1);
    lfo.num_points += 4;
}
exports.applyAmplitude = applyAmplitude;
function applyPitch(lfo, start, end, note) {
    note = 1 - note / 96;
    lfo.points.push(start, note);
    lfo.points.push(end, note);
    lfo.num_points += 2;
}
exports.applyPitch = applyPitch;
//# sourceMappingURL=lfoRepr.js.map