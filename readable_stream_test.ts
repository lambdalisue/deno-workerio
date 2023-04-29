import { assertEquals } from "https://deno.land/std@0.185.0/testing/asserts.ts";
import { concat } from "https://deno.land/std@0.185.0/bytes/mod.ts";
import { readableStreamFromWorker } from "./mod.ts";
import { MockWorker } from "./test_util.ts";

Deno.test(
  "readableStreamFromWorker returns ReadableStream that yields data from worker",
  async () => {
    const worker = new MockWorker();
    const rstream = readableStreamFromWorker(worker);
    worker.postMessage(new Uint8Array([0, 1, 2, 3, 4]));
    worker.postMessage(new Uint8Array([5, 6, 7, 8, 9]));
    worker.postMessage(null);
    const chunks = [];
    for await (const chunk of rstream) {
      chunks.push(chunk);
    }
    const content = concat(...chunks);
    assertEquals(content, new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]));
  },
);

Deno.test(
  "readableStreamFromWorker returns ReadableStream that yields data from worker prior to close",
  async () => {
    const worker = new MockWorker();
    const rstream = readableStreamFromWorker(worker);
    worker.postMessage(new Uint8Array([0, 1, 2, 3, 4]));
    worker.postMessage(null);
    worker.postMessage(new Uint8Array([5, 6, 7, 8, 9]));
    const chunks = [];
    for await (const chunk of rstream) {
      chunks.push(chunk);
    }
    const content = concat(...chunks);
    assertEquals(content, new Uint8Array([0, 1, 2, 3, 4]));
  },
);
