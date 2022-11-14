import { streams } from "./deps_test.ts";
import { WorkerReader, WorkerWriter } from "./mod.ts";

async function main(): Promise<void> {
  // deno-lint-ignore no-explicit-any
  const worker = self as any;
  const reader = new WorkerReader(worker);
  const writer = new WorkerWriter(worker);

  for await (const data of streams.iterateReader(reader)) {
    await streams.writeAll(writer, data);
  }
}

main().catch((e) => console.error(e));
