import {
  assertEquals,
  assertInstanceOf,
} from "https://deno.land/std@0.224.0/testing/asserts.ts";
import { WorkerWriter as WorkerWriterV2 } from "https://deno.land/x/workerio@v3.1.0/mod.ts";
import { WorkerWriter as WorkerWriterV1 } from "https://deno.land/x/workerio@v3.1.0/mod.ts";
import { WorkerWriter } from "./mod.ts";
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
  Deno.bench(
    `WorkerWriter (${size.toString().padStart(2)} Bytes x ${count})`,
    {
      group: size.toString(),
      baseline: true,
    },
    async () => {
      const worker = new MockWorker();
      let total = 0;
      worker.addEventListener("message", (ev) => {
        assertInstanceOf(ev, MessageEvent<Uint8Array>);
        total += ev.data.length;
      });
      const writer = new WorkerWriter(worker);
      for (let i = 0; i < count; i++) {
        const data = new Uint8Array(size);
        await writer.write(data);
      }
      assertEquals(total, size * count);
    },
  );

  Deno.bench(
    `WorkerWriter v2 (${size.toString().padStart(2)} Bytes x ${count})`,
    {
      group: size.toString(),
    },
    async () => {
      const worker = new MockWorker();
      let total = 0;
      worker.addEventListener("message", (ev) => {
        assertInstanceOf(ev, MessageEvent<Uint8Array>);
        total += ev.data.length;
      });
      const writer = new WorkerWriterV2(worker);
      for (let i = 0; i < count; i++) {
        const data = new Uint8Array(size);
        await writer.write(data);
      }
      assertEquals(total, size * count);
    },
  );

  Deno.bench(
    `WorkerWriter v1 (${size.toString().padStart(2)} Bytes x ${count})`,
    {
      group: size.toString(),
    },
    async () => {
      const worker = new MockWorker();
      let total = 0;
      worker.addEventListener("message", (ev) => {
        assertInstanceOf(ev, MessageEvent<Uint8Array>);
        total += ev.data.length;
      });
      const writer = new WorkerWriterV1(worker);
      for (let i = 0; i < count; i++) {
        const data = new Uint8Array(size);
        await writer.write(data);
      }
      assertEquals(total, size * count);
    },
  );
}
