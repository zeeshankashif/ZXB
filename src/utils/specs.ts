/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SpecItem {
  id: string;
  tag: string;
  title: string;
  metric: string;
  description: string;
}

export const GEAR_SPECS: SpecItem[] = [
  {
    id: 'spec-glass',
    tag: 'LAYER // 01',
    title: 'Sapphire Crystal Armor',
    metric: '9.0 MOHS HARDNESS',
    description: 'Ultra-curved single-crystal synthetic sapphire casing treated with double-sided anti-reflective ionized coating, offering near-absolute clarity and structural reinforcement.',
  },
  {
    id: 'spec-dial',
    tag: 'LAYER // 02',
    title: 'Solid Chrono Dial Plate',
    metric: '1.15mm COMPRESSION',
    description: 'Machined from aerospace-grade Titanium-Aluminium alloy. Matte sandblasted carbon-black coat featuring physical hour markers with molecular tritium-gas glow dots.',
  },
  {
    id: 'spec-gears',
    tag: 'LAYER // 03',
    title: 'Audio-Kinetic Engine Core',
    metric: '32,800 BPH OSCILLATION',
    description: 'Prototypical cybernetic mechanical cluster with an icosahedral support cage. High-torque cogs rotate dynamically based on sonic pulse frequencies and kinetic momentum.',
  }
];

export const GENERAL_SPECS = [
  { label: 'CALIBRE', value: 'ZEXAN CONCEPT v1.0' },
  { label: 'POWER RESERVE', value: '72H / HIGH FIDELITY DENSE BATTERY' },
  { label: 'TOLERANCE', value: '±0.04 MICRONS GEOMETRIC FIT' },
  { label: 'FREQUENCY', value: '82 BPM SYNCHRONIZED BEAT' },
];
