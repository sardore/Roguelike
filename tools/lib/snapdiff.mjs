// Compares two load-end snapshots (tools/refactor/load-reads.mjs --snapshot): per boot situation, the value of every
// listed name. Function names are not values (a rename or a new name for an anonymous function must not count).
// map: { oldName: newName } for names that changed on purpose.
import fs from 'node:fs';

const norm = (v) => JSON.stringify(v).replace(/<fn [^>]*>/g, '<fn>');

export function compareSnapshots(oldFile, newFile, map = {}) {
  const a = JSON.parse(fs.readFileSync(oldFile, 'utf8')), b = JSON.parse(fs.readFileSync(newFile, 'utf8'));
  let compared = 0;
  const differing = [];
  for (const situation of Object.keys(a)) {
    for (const key of Object.keys(a[situation] || {})) {
      compared++;
      const to = map[key] || key;
      if (!b[situation] || !(to in b[situation])) differing.push(`${situation}: ${key} is missing in the new build`);
      else if (norm(a[situation][key]) !== norm(b[situation][to])) differing.push(`${situation}: ${key}${to === key ? '' : ` -> ${to}`} differs`);
    }
  }
  // an empty comparison is a failure of the measurement, not a pass
  return { compared, differing };
}
