import { Lfo, Modulation } from "./schema";

export function createLfo(
  start: number
) {
  const newLfo = {} as Lfo;
  newLfo.name = "generated";
  newLfo.points = [0,1,start,1];
  newLfo.num_points = 2;
  newLfo.powers = [];
  return newLfo;
}

export function createModulation(
  target: string,
  lfo: Lfo,
  end: number
) {
  lfo.points.push(end, 1);
  lfo.num_points++;
  const newMod = {} as Modulation;
  newMod.source = "lfo_1";
  newMod.destination = target;
  newMod.line_mapping = lfo;
  return newMod;
}

export function applyAmplitude(
  lfo: Lfo,
  start: number,
  end: number,
  velocity: number
) {
  lfo.points.push(start, 1);
  lfo.points.push(start, 1-velocity);
  lfo.points.push(end, 1-velocity);
  lfo.points.push(end, 1);
  lfo.num_points += 4;
}

export function applyPitch(
  lfo: Lfo,
  start: number,
  end: number,
  note: number
) {
  note = 1 - note/96;
  lfo.points.push(start, note);
  lfo.points.push(end, note);
  lfo.num_points += 2;
}