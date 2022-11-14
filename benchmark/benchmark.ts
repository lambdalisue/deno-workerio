import { parse } from "https://deno.land/std@0.164.0/flags/mod.ts";
import { assertEquals, delay, io } from "../deps_test.ts";
import { WorkerReader, WorkerWriter } from "../mod.ts";

async function timeout(d: number): Promise<never> {
  return await delay(d).then(() => Promise.reject("Timeout"));
}

async function timeIt(fn: () => Promise<void>): Promise<number> {
  const start = new Date();
  await fn();
  const end = new Date();
  const elapsed = end.getTime() - start.getTime();
  return elapsed;
}

async function benchmark(
  buffer: Uint8Array,
  reader: Deno.Reader,
  writer: Deno.Writer,
): Promise<[number, number]> {
  const size = buffer.length;

  const consumer = async () => {
    const r = await io.readAll(new io.LimitedReader(reader, size));
    assertEquals(r.length, size);
  };

  const producer = async () => {
    await io.writeAll(writer, buffer);
  };

  const [rt, wt] = await Promise.race([
    Promise.all([
      timeIt(consumer),
      timeIt(producer),
    ]),
    timeout(30000),
  ]);

  return [rt, wt];
}

async function main(): Promise<void> {
  const args = parse(Deno.args, {
    string: ["n", "size"],
    default: {
      n: 5,
      size: 10,
    },
  });
  const worker = new Worker(
    new URL("../test_worker.ts", import.meta.url).href,
    {
      type: "module",
    },
  );
  try {
    const size = parseFloat(args.size) * 2 ** 20;
    const n = parseInt(args.n, 10);
    const buffer = new Uint8Array(size);
    const reader = new WorkerReader(worker);
    const writer = new WorkerWriter(worker);
    const rts = [];
    const wts = [];
    console.log("===========================================================");
    console.log(`Transfer: ${size / 2 ** 20} MiB`);
    console.log(`N:        ${n} times`);
    console.log("===========================================================");
    console.log("Relaxing 1 sec ...");
    await delay(1000);
    console.log("Start benchmark");
    for (const i of Array(n).keys()) {
      const [rt, wt] = await benchmark(buffer, reader, writer);
      rts.push(rt);
      wts.push(wt);
      console.log(i + 1, `Reader: ${rt} [ms]`, `Writer: ${wt} [ms]`);
    }
    console.log("===========================================================");
    const rt = rts.reduce((a, v) => a + v, 0) / n;
    const wt = wts.reduce((a, v) => a + v, 0) / n;
    const rbps = size * 8 * 1000 / rt;
    const wbps = size * 8 * 1000 / wt;
    const srt = rt.toPrecision(5).padStart(5);
    const swt = wt.toPrecision(5).padStart(5);
    const srbps = (rbps / 10 ** 6).toPrecision(5).padStart(5);
    const swbps = (wbps / 10 ** 6).toPrecision(5).padStart(5);
    console.log(`Reader: Avg. ${srt} msec (${srbps} Mbps)`);
    console.log(`Writer: Avg. ${swt} msec (${swbps} Mbps)`);
    console.log("===========================================================");
  } finally {
    worker.terminate();
  }
}

main().catch((e) => console.error(e)).then(() => Deno.exit(0));
