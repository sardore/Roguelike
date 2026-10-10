#!/usr/bin/env node
// Report on the globals the runtime publishes: where they are defined, which members each defines,
// and which of those members game code reaches. Output: JSON, or `--md` for docs/BRIDGES.md.
import { analyzeBridges } from '../lib/bridges.mjs';

const file = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'src/scripts/10-runtime.js';
const { out } = analyzeBridges(file);
if (process.argv.includes('--md')) {
  const L = ['# 공개 전역(브리지) 판정표', '', '`node tools/refactor/bridge-report.mjs --md`가 만든다.', '',
    '- **게임**: 게임 코드가 읽는다. 릴리스에 남는다.', '- **QA**: 아무도 읽지 않거나, 읽는 곳이 모두 다른 QA 멤버 안이다. 빌드 플래그 `--qa`로만 들어간다. `[테스트]`는 `tests/`가 쓴다.', '',
    '판정은 이름이 아니라 읽는 곳으로 한다. 별칭(`const api = window.__X__`)을 통한 읽기도 센다. 이름만으로 본 읽기는 과대 계산되어 게임 쪽으로 기운다.', ''];
  for (const x of out) {
    const d = Object.entries(x.defined);
    const g = d.filter(([, v]) => !v.qa), q = d.filter(([, v]) => v.qa);
    const kind = g.length ? (q.length ? '게임+QA 섞임' : '게임') : (!d.length && x.gameReads ? '게임' : x.testReadsObject || d.length ? 'QA' : '전체 미사용');
    L.push(`## ${x.name} — ${kind} (줄 ${x.defs.join(',')})`);
    if (g.length) L.push(`- 게임: ${g.map(([k, v]) => `${k}(${v.reads})`).join(', ')}`);
    if (q.length) L.push(`- QA: ${q.map(([k, v]) => k + (v.test ? '[테스트]' : '')).join(', ')}`);
    L.push('');
  }
  console.log(L.join('\n'));
} else console.log(JSON.stringify(out, null, 1));
