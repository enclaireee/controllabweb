// Run: npm test   (Node strips the types natively — no framework)
//
// Covers the two pieces of logic that fail silently: the average shown to a
// praktikan, and the score validation that has to agree with the database
// CHECK constraint.

import assert from "node:assert/strict";
import { test } from "node:test";

import {
  PENILAIAN_KOSONG,
  rataRata,
  sisaHari,
  validasiNilai,
  type Penilaian,
} from "./praktikum.ts";

const nilai = (p: Partial<Penilaian>): Penilaian => ({
  ...PENILAIAN_KOSONG,
  ...p,
});

test("rataRata is the plain mean of all three", () => {
  assert.equal(
    rataRata(nilai({ nilaiPretest: 80, nilaiQna: 90, nilaiLaprak: 100 })),
    90,
  );
  assert.equal(
    rataRata(nilai({ nilaiPretest: 0, nilaiQna: 0, nilaiLaprak: 0 })),
    0,
    "all-zero is a real average, not an empty one",
  );
});

test("rataRata rounds to 2 decimals rather than trailing float noise", () => {
  // 80+85+91 = 256 / 3 = 85.333...
  assert.equal(
    rataRata(nilai({ nilaiPretest: 80, nilaiQna: 85, nilaiLaprak: 91 })),
    85.33,
  );
});

test("rataRata is null until all three exist", () => {
  assert.equal(rataRata(PENILAIAN_KOSONG), null);
  assert.equal(rataRata(nilai({ nilaiPretest: 90 })), null);
  assert.equal(
    rataRata(nilai({ nilaiPretest: 90, nilaiQna: 90 })),
    null,
    "two of three must not produce a number that reads as a final grade",
  );
});

test("validasiNilai accepts the whole legal range", () => {
  assert.deepEqual(validasiNilai("0"), { nilai: 0 });
  assert.deepEqual(validasiNilai("100"), { nilai: 100 });
  assert.deepEqual(validasiNilai(" 75 "), { nilai: 75 }, "trims whitespace");
});

test("validasiNilai treats empty as clearing the score, not an error", () => {
  assert.deepEqual(validasiNilai(""), { nilai: null });
  assert.deepEqual(validasiNilai("   "), { nilai: null });
});

test("validasiNilai rejects what the CHECK would reject", () => {
  for (const buruk of ["101", "999", "-1", "8.5", "abc", "1e2", "08a", "١٢"]) {
    assert.ok(
      "pesan" in validasiNilai(buruk),
      `${JSON.stringify(buruk)} should be rejected`,
    );
  }
});

test("sisaHari counts whole days in both directions", () => {
  const now = new Date("2026-08-06T12:00:00+07:00");
  assert.equal(sisaHari("2026-08-08T12:00:00+07:00", now), 2);
  assert.equal(sisaHari("2026-08-06T12:00:00+07:00", now), 0);
  assert.equal(sisaHari("2026-08-01T12:00:00+07:00", now), -5);
});
