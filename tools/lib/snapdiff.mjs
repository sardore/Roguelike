// Compares two load-end snapshots (tools/refactor/load-reads.mjs --snapshot): per boot situation, the value of every
// listed name. Function names are not values (a rename or a new name for an anonymous function must not count).
// map: { oldName: newName } for names that changed on purpose.
// removed: { name: [member, ...] } for members an object lost on purpose (a register method that became a table): they are taken out of the
// old value before the comparison and must exist there, so a removal that did not happen is reported.
import fs from 'node:fs';

const norm = (v) => JSON.stringify(v).replace(/<fn [^>]*>/g, '<fn>');

export function compareSnapshots(oldFile, newFile, map = {}, removed = {}) {
  const a = JSON.parse(fs.readFileSync(oldFile, 'utf8')), b = JSON.parse(fs.readFileSync(newFile, 'utf8'));
  let compared = 0;
  const differing = [];
  for (const situation of Object.keys(a)) {
    for (const [name, members] of Object.entries(removed)) {
      const v = a[situation]?.[name];
      for (const m of members) {
        if (v && typeof v === 'object' && m in v) delete v[m];
        else differing.push(`${situation}: ${name}.${m} is not a member of the old value`);
      }
    }
  }
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
