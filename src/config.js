import { readFile, outputFile } from 'fs-promise';
import { join } from 'path';
import { assign, omit } from 'lodash';

const configFile = join(__dirname, '..', 'data', 'config.json');

let configs = {};

export default function config(key) {
  return configs[key];
}

export function visibles() {
  return omit(configs, [ 'SALT', 'CREDENTIAL' ]);
}

export async function reload() {
  try {
    configs = JSON.parse(await readFile(configFile, 'utf8'));
  } catch (e) {
  }
}

export async function save(cfg) {
  assign(configs, cfg);
  await outputFile(configFile, JSON.stringify(configs));
}

reload();
