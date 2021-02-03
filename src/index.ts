import { Midi } from "@tonejs/midi";
import { readFileSync, writeFileSync } from "fs";
import { createLfo, applyAmplitude, applyPitch, createModulation} from "./lfoRepr";
import { RootObject, Lfo, Voice, Modulation } from "./schema";

const args = process.argv.slice(2);
const midiFile = readFileSync(args[0] || "./old-macdonald-had-a-farm.mid");
const midi = new Midi(midiFile);
const strData = readFileSync("./input.vital", {
  encoding: "utf-8",
});
const data = JSON.parse(strData) as RootObject;

const voiceCount = parseInt(args[1]) || 6;
let voices: Voice[] = [];
let modulations: Modulation[] = [];

for (let i = 0; i < voiceCount; i++) {
  const newVoice = {} as Voice;
  newVoice.amplitudeLfo = createLfo(0);
  newVoice.pitchLfo = createLfo(0);
  newVoice.occupied = 0;
  voices.push(newVoice);
}

const targetTrack = midi.tracks[0];
targetTrack.notes.forEach((v) => {
  const noteStartPercent = v.time / targetTrack.duration;
  const noteEndPercent = (v.time + v.duration) / targetTrack.duration;
  for (let i = 0; i < voiceCount; i++) {
    if (noteStartPercent < voices[i].occupied) continue;
    if (voices[i].amplitudeLfo.num_points >= 95) {
      modulations.push(createModulation("modulation_"+(i+2)+"_amount", voices[i].amplitudeLfo, noteStartPercent));
      voices[i].amplitudeLfo = createLfo(noteStartPercent);
    }
    if (voices[i].pitchLfo.num_points >= 95) {
      modulations.push(createModulation("lfo_"+(i+3)+"_keytrack_transpose", voices[i].pitchLfo, noteStartPercent));
      voices[i].pitchLfo = createLfo(noteStartPercent);
    }
    voices[i].occupied = noteEndPercent;

    applyAmplitude(voices[i].amplitudeLfo, noteStartPercent, noteEndPercent, v.velocity);
    applyPitch(voices[i].pitchLfo, noteStartPercent, noteEndPercent, v.midi);
    break;
  }
});

for (let i = 0; i < voiceCount; i++) {
  if (voices[i].occupied === 0) continue;
  modulations.push(createModulation("modulation_"+(i+2)+"_amount", voices[i].amplitudeLfo, 1));
  modulations.push(createModulation("lfo_"+(i+3)+"_keytrack_transpose", voices[i].pitchLfo, 1));
}

for (let i = 0; i < modulations.length; i++) {
  modulations[i].line_mapping.powers = new Array(modulations[i].line_mapping.num_points).fill(0);
  data.settings.modulations[63-i] = modulations[i];
  data.settings["modulation_"+(64-i)+"_amount"] = (modulations[i].destination.endsWith("transpose") ? 1 : .1);
}

writeFileSync("./output.vital", JSON.stringify(data));
