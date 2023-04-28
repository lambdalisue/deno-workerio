import { assertEquals } from "https://deno.land/std@0.185.0/testing/asserts.ts";
import * as streams from "https://deno.land/std@0.185.0/streams/mod.ts";
import { WorkerReader as WorkerReaderV2 } from "https://deno.land/x/workerio@v2.0.1/mod.ts";
import { WorkerReader as WorkerReaderV1 } from "https://deno.land/x/workerio@v1.4.4/mod.ts";
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
  const data = new Uint8Array(size);

  Deno.bench(`WorkerReader (${size.toString().padStart(2)} Bytes x ${count})`, {
    group: size.toString(),
    baseline: true,
  }, async () => {
    const worker = new MockWorker();
    const reader = new WorkerReader(worker);
    for (let i = 0; i < count; i++) {
      worker.postMessage(data);
    }
    reader.close();
    const content = await streams.readAll(reader);
    assertEquals(content.length, size * count);
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
        worker.postMessage(data);
      }
      reader.close();
      const content = await streams.readAll(reader);
      assertEquals(content.length, size * count);
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
        worker.postMessage(data);
      }
      reader.close();
      const content = await streams.readAll(reader);
      assertEquals(content.length, size * count);
    },
  );
}
