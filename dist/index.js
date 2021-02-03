"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const midi_1 = require("@tonejs/midi");
const fs_1 = require("fs");
const lfoRepr_1 = require("./lfoRepr");
const args = process.argv.slice(2);
const midiFile = fs_1.readFileSync(args[0] || "./old-macdonald-had-a-farm.mid");
const midi = new midi_1.Midi(midiFile);
const strData = fs_1.readFileSync("./input.vital", {
    encoding: "utf-8",
});
const data = JSON.parse(strData);
const voiceCount = parseInt(args[1]) || 6;
let voices = [];
let modulations = [];
for (let i = 0; i < voiceCount; i++) {
    const newVoice = {};
    newVoice.amplitudeLfo = lfoRepr_1.createLfo(0);
    newVoice.pitchLfo = lfoRepr_1.createLfo(0);
    newVoice.occupied = 0;
    voices.push(newVoice);
}
const targetTrack = midi.tracks[0];
targetTrack.notes.forEach((v) => {
    const noteStartPercent = v.time / targetTrack.duration;
    const noteEndPercent = (v.time + v.duration) / targetTrack.duration;
    for (let i = 0; i < voiceCount; i++) {
        if (noteStartPercent < voices[i].occupied)
            continue;
        if (voices[i].amplitudeLfo.num_points >= 95) {
            modulations.push(lfoRepr_1.createModulation("modulation_" + (i + 2) + "_amount", voices[i].amplitudeLfo, noteStartPercent));
            voices[i].amplitudeLfo = lfoRepr_1.createLfo(noteStartPercent);
        }
        if (voices[i].pitchLfo.num_points >= 95) {
            modulations.push(lfoRepr_1.createModulation("lfo_" + (i + 3) + "_keytrack_transpose", voices[i].pitchLfo, noteStartPercent));
            voices[i].pitchLfo = lfoRepr_1.createLfo(noteStartPercent);
        }
        voices[i].occupied = noteEndPercent;
        lfoRepr_1.applyAmplitude(voices[i].amplitudeLfo, noteStartPercent, noteEndPercent, v.velocity);
        lfoRepr_1.applyPitch(voices[i].pitchLfo, noteStartPercent, noteEndPercent, v.midi);
        break;
    }
});
for (let i = 0; i < voiceCount; i++) {
    if (voices[i].occupied === 0)
        continue;
    modulations.push(lfoRepr_1.createModulation("modulation_" + (i + 2) + "_amount", voices[i].amplitudeLfo, 1));
    modulations.push(lfoRepr_1.createModulation("lfo_" + (i + 3) + "_keytrack_transpose", voices[i].pitchLfo, 1));
}
for (let i = 0; i < modulations.length; i++) {
    modulations[i].line_mapping.powers = new Array(modulations[i].line_mapping.num_points).fill(0);
    data.settings.modulations[63 - i] = modulations[i];
    data.settings["modulation_" + (64 - i) + "_amount"] = (modulations[i].destination.endsWith("transpose") ? 1 : .1);
}
fs_1.writeFileSync("./output.vital", JSON.stringify(data));
//# sourceMappingURL=index.js.map