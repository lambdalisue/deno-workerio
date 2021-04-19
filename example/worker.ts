import * as io from "https://deno.land/std@0.93.0/io/mod.ts";
import { WorkerReader, WorkerWriter } from "../mod.ts";

const decoder = new TextDecoder();
const encoder = new TextEncoder();

async function main(): Promise<void> {
  // deno-lint-ignore no-explicit-any
  const worker = self as any;
  const reader = new WorkerReader(worker);
  const writer = new WorkerWriter(worker);

  for await (const data of io.iter(reader)) {
    const text = decoder.decode(data);
    await writer.write(encoder.encode(`!!! ${text} !!!`));
  }
}

main().catch((e) => console.error(e));
