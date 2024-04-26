import { assertEquals } from "https://deno.land/std@0.224.0/testing/asserts.ts";
import { WorkerReader as WorkerReaderV2 } from "https://deno.land/x/workerio@v3.1.0/mod.ts";
import { WorkerReader as WorkerReaderV1 } from "https://deno.land/x/workerio@v3.1.0/mod.ts";
import { WorkerReader } from "./mod.ts";
import { MockWorker } from "./test_util.ts";

const count = 100;
const sizes = [
  64,
  128,
  256,
  512,
  1024,
];

for (const size of sizes) {
  Deno.bench(`WorkerReader (${size.toString().padStart(2)} Bytes x ${count})`, {
    group: size.toString(),
    baseline: true,
  }, async () => {
    const worker = new MockWorker();
    const reader = new WorkerReader(worker);
    for (let i = 0; i < count; i++) {
      const data = new Uint8Array(size);
      worker.postMessage(data);
    }
    reader.close();
    let total = 0;
    while (true) {
      const p = new Uint8Array(1024);
      const n = await reader.read(p);
      if (n === null) break;
      total += n;
    }
    assertEquals(total, size * count);
  });

  Deno.bench(
    `WorkerReader v2 (${size.toString().padStart(2)} Bytes x ${count})`,
    {
      group: size.toString(),
    },
    async () => {
      const worker = new MockWorker();
      const reader = new WorkerReaderV2(worker);
      for (let i = 0; i < count; i++) {
        const data = new Uint8Array(size);
        worker.postMessage(data);
      }
      reader.close();
      let total = 0;
      while (true) {
        const p = new Uint8Array(1024);
        const n = await reader.read(p);
        if (n === null) break;
        total += n;
      }
      assertEquals(total, size * count);
    },
  );

  Deno.bench(
    `WorkerReader v1 (${size.toString().padStart(2)} Bytes x ${count})`,
    {
      group: size.toString(),
    },
    async () => {
      const worker = new MockWorker();
      const reader = new WorkerReaderV1(worker);
      for (let i = 0; i < count; i++) {
        const data = new Uint8Array(size);
        worker.postMessage(data);
      }
      reader.close();
      let total = 0;
      while (true) {
        const p = new Uint8Array(1024);
        const n = await reader.read(p);
        if (n === null) break;
        total += n;
      }
      assertEquals(total, size * count);
    },
  );
}
