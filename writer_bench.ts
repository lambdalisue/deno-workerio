import {
  assertEquals,
  assertInstanceOf,
} from "https://deno.land/std@0.185.0/testing/asserts.ts";
import { concat } from "https://deno.land/std@0.185.0/bytes/mod.ts";
import { WorkerWriter as WorkerWriterV2 } from "https://deno.land/x/workerio@v2.0.1/mod.ts";
import { WorkerWriter as WorkerWriterV1 } from "https://deno.land/x/workerio@v1.4.4/mod.ts";
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
  const data = new Uint8Array(size);

  Deno.bench(
    `WorkerWriter (${size.toString().padStart(2)} Bytes x ${count})`,
    {
      group: size.toString(),
      baseline: true,
    },
    async () => {
      const worker = new MockWorker();
      const chunks: Uint8Array[] = [];
      worker.addEventListener("message", (ev) => {
        assertInstanceOf(ev, MessageEvent<Uint8Array>);
        chunks.push(ev.data);
      });
      const writer = new WorkerWriter(worker);
      for (let i = 0; i < count; i++) {
        await writer.write(data);
      }
      const content = concat(...chunks);
      assertEquals(content.length, size * count);
    },
  );

  Deno.bench(
    `WorkerWriter v2 (${size.toString().padStart(2)} Bytes x ${count})`,
    {
      group: size.toString(),
    },
    async () => {
      const worker = new MockWorker();
      const chunks: Uint8Array[] = [];
      worker.addEventListener("message", (ev) => {
        assertInstanceOf(ev, MessageEvent<Uint8Array>);
        chunks.push(ev.data);
      });
      const writer = new WorkerWriterV2(worker);
      for (let i = 0; i < count; i++) {
        await writer.write(data);
      }
      const content = concat(...chunks);
      assertEquals(content.length, size * count);
    },
  );

  Deno.bench(
    `WorkerWriter v1 (${size.toString().padStart(2)} Bytes x ${count})`,
    {
      group: size.toString(),
    },
    async () => {
      const worker = new MockWorker();
      const chunks: Uint8Array[] = [];
      worker.addEventListener("message", (ev) => {
        assertInstanceOf(ev, MessageEvent<Uint8Array>);
        chunks.push(ev.data);
      });
      const writer = new WorkerWriterV1(worker);
      for (let i = 0; i < count; i++) {
        await writer.write(data);
      }
      const content = concat(...chunks);
      assertEquals(content.length, size * count);
    },
  );
}
