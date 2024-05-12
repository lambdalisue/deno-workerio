import { assertEquals, assertInstanceOf } from "@std/assert";
import { concat } from "@std/bytes";
import { writableStreamFromWorker } from "./mod.ts";
import { MockWorker } from "./test_util.ts";

Deno.test(
  "writableStreamFromWorker returns WritableStream that writes data to worker",
  async () => {
    const worker = new MockWorker() as Worker;
    const chunks: Uint8Array[] = [];
    worker.addEventListener("message", (ev) => {
      assertInstanceOf(ev, MessageEvent<Uint8Array>);
      chunks.push(ev.data);
    });
    const wstream = writableStreamFromWorker(worker);
    const writer = wstream.getWriter();
    await writer.ready;
    await writer.write(new Uint8Array([0, 1, 2, 3, 4]));
    await writer.write(new Uint8Array([5, 6, 7, 8, 9]));
    const content = concat(chunks);
    assertEquals(content, new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]));
  },
);
