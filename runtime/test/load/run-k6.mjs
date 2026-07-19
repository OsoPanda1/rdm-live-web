/**
 * Load test runner for RDM Runtime
 * Requires: k6 (https://k6.io)
 *
 * Usage: node run-k6.mjs
 *
 * Scenarios:
 *   1. Base load (200-500 req/s) — 50% new auth, 50% cached session
 *   2. Micro-batching (1000 req/s) — homogeneous operations
 *   3. Stress + quotas (2-3x load) — verify circuit breaker
 */

const scenarios = [
  {
    name: "base-load",
    script: `
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    base_load: {
      executor: 'ramping-arrival-rate',
      startRate: 200,
      timeUnit: '1s',
      stages: [
        { target: 200, duration: '10s' },
        { target: 500, duration: '20s' },
        { target: 500, duration: '10s' },
      ],
      preAllocatedVUs: 50,
      maxVUs: 100,
    },
  },
  thresholds: {
    http_req_duration: ['p(50)<15', 'p(90)<35', 'p(99)<80'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const withTicket = __VU % 2 === 0;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': withTicket ? '' : 'Bearer test-token',
    'x-rdm-session-id': withTicket ? 'sess-' + __VU : '',
  };

  const res = http.post('http://localhost:3000/runtime/invoke', JSON.stringify({
    pluginId: 'sdmd-ledger',
    operation: 'query',
    payload: { id: __VU },
  }), { headers });

  check(res, {
    'status is 200': (r) => r.status === 200,
    'duration < 80ms': (r) => r.timings.duration < 80,
  });
}
`.trim(),
  },
];

console.log(JSON.stringify(scenarios, null, 2));
console.log('\nRun with: k6 run test/load/scenario.js');
