import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.185.0/testing/asserts.ts";
import * as io from "https://deno.land/std@0.185.0/io/mod.ts";
import * as streams from "https://deno.land/std@0.185.0/streams/mod.ts";
import { WorkerReader, WorkerWriter } from "./mod.ts";

async function timeIt(fn: () => Promise<void>): Promise<number> {
  const start = new Date();
  await fn();
  const end = new Date();
  const elapsed = end.getTime() - start.getTime();
  return elapsed;
}

Deno.test({
  name: "Transferring small data from Self to Worker to Self",
  fn: async () => {
    const worker = new Worker(
      new URL("./test_worker.ts", import.meta.url).href,
      {
        type: "module",
      },
    );
    try {
      const reader = new WorkerReader(worker);
      const writer = new WorkerWriter(worker);

      const size = 16;
      const buffer = new Uint8Array(size);

      const consumer = async () => {
        const r = await streams.readAll(
          new io.LimitedReader(reader, size),
        );
        assertEquals(r.length, size);
      };

      const producer = async () => {
        await streams.writeAll(writer, buffer);
      };

      const [rt, wt] = await Promise.all([
        timeIt(consumer),
        timeIt(producer),
      ]);

      // Peformance check
      const rtThreshold = 500;
      const wtThreshold = 500;
      assert(rt < rtThreshold, "Reader is too slow");
      assert(wt < wtThreshold, "Writer is too slow");
    } finally {
      worker.terminate();
    }
  },
  sanitizeOps: false,
});

Deno.test({
  name: "Transferring medium data from Self to Worker to Self",
  fn: async () => {
    const worker = new Worker(
      new URL("./test_worker.ts", import.meta.url).href,
      {
        type: "module",
      },
    );
    try {
      const reader = new WorkerReader(worker);
      const writer = new WorkerWriter(worker);

      const size = 1024 * 32;
      const buffer = new Uint8Array(size);

      const consumer = async () => {
        const r = await streams.readAll(
          new io.LimitedReader(reader, size),
        );
        assertEquals(r.length, size);
      };

      const producer = async () => {
        await streams.writeAll(writer, buffer);
      };

      const [rt, wt] = await Promise.all([
        timeIt(consumer),
        timeIt(producer),
      ]);

      // Peformance check
      const rtThreshold = 750;
      const wtThreshold = 750;
      assert(rt < rtThreshold, "Reader is too slow");
      assert(wt < wtThreshold, "Writer is too slow");
    } finally {
      worker.terminate();
    }
  },
  sanitizeOps: false,
});

Deno.test({
  name: "Transferring massive data from Self to Worker to Self",
  fn: async () => {
    const worker = new Worker(
      new URL("./test_worker.ts", import.meta.url).href,
      {
        type: "module",
      },
    );
    try {
      const reader = new WorkerReader(worker);
      const writer = new WorkerWriter(worker);

      const size = 1024 * 1024 * 32;
      const buffer = new Uint8Array(size);

      const consumer = async () => {
        const r = await streams.readAll(new io.LimitedReader(reader, size));
        assertEquals(r.length, size);
      };

      const producer = async () => {
        await streams.writeAll(writer, buffer);
      };

      const [rt, wt] = await Promise.all([
        timeIt(consumer),
        timeIt(producer),
      ]);

      // Peformance check
      const rtThreshold = 1000;
      const wtThreshold = 1000;
      assert(rt < rtThreshold, "Reader is too slow");
      assert(wt < wtThreshold, "Writer is too slow");
    } finally {
      worker.terminate();
    }
  },
  sanitizeOps: false,
});
