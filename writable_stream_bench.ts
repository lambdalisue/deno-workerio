import { assertEquals, assertInstanceOf } from "@std/assert";
import { writableStreamFromWorker } from "./mod.ts";
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
    `writableStreamFromWorker (${
      size.toString().padStart(2)
    } Bytes x ${count})`,
    {
      group: size.toString(),
      baseline: true,
    },
    async () => {
      const worker = new MockWorker() as Worker;
      let total = 0;
      worker.addEventListener("message", (ev) => {
        assertInstanceOf(ev, MessageEvent<Uint8Array>);
        total += ev.data.length;
      });
      const wstream = writableStreamFromWorker(worker);
      const writer = wstream.getWriter();
      for (let i = 0; i < count; i++) {
        const data = new Uint8Array(size);
        await writer.write(data);
      }
      writer.releaseLock();
      assertEquals(total, size * count);
    },
  );
}
