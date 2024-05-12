# workerio

[![deno land](http://img.shields.io/badge/available%20on-deno.land/x-lightgrey.svg?logo=deno)](https://deno.land/x/workerio)
[![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/deno.land/x/workerio/mod.ts)
[![Test](https://github.com/lambdalisue/deno-workerio/actions/workflows/test.yml/badge.svg)](https://github.com/lambdalisue/deno-workerio/actions/workflows/test.yml)

[Deno][deno] module to translate Worker's system of messages into
[`ReadableStream<Uint8Array>`][readablestream] and
[`WritableStream<Uint8Array>`][writablestream] or [`Deno.Reader`][reader] and
[`Deno.Writer`][writer].

[deno]: https://deno.land/
[reader]: https://doc.deno.land/builtin/stable#Deno.Reader
[writer]: https://doc.deno.land/builtin/stable#Deno.Writer
[ReadableStream]: https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream
[WritableStream]: https://developer.mozilla.org/en-US/docs/Web/API/WritableStream

## Example

### ReadableStream/WritableStream

#### Server

```typescript
import {
  readableStreamFromWorker,
  writableStreamFromWorker,
} from "https://deno.land/x/workerio@$MODULE_VERSION/mod.ts";

const decoder = new TextDecoder();
const encoder = new TextEncoder();

const worker = new Worker(new URL("./worker.ts", import.meta.url).href, {
  type: "module",
});

const reader = readableStreamFromWorker(worker);
const writer = writableStreamFromWorker(worker);
const w = writer.getWriter();

await w.write(encoder.encode("Hello"));
await w.write(encoder.encode("World"));
w.releaseLock();

for await (const data of reader) {
  const text = decoder.decode(data);
  console.log(text);
}
```

#### Worker

```typescript
import {
  readableStreamFromWorker,
  writableStreamFromWorker,
} from "https://deno.land/x/workerio@$MODULE_VERSION/mod.ts";

const decoder = new TextDecoder();
const encoder = new TextEncoder();

async function main(): Promise<void> {
  const worker = self as unknown as Worker;
  const reader = readableStreamFromWorker(worker);
  const writer = writableStreamFromWorker(worker);
  const w = writer.getWriter();

  for await (const data of reader) {
    const text = decoder.decode(data);
    await w.write(encoder.encode(`!!! ${text} !!!`));
  }
  w.releaseLock();
}

main().catch((e) => console.error(e));
```

### Deno.Reader/Deno.Writer

#### Server

```typescript
import {
  WorkerReader,
  WorkerWriter,
} from "https://deno.land/x/workerio@$MODULE_VERSION/mod.ts";

const decoder = new TextDecoder();
const encoder = new TextEncoder();

const worker = new Worker(new URL("./worker.ts", import.meta.url).href, {
  type: "module",
});

const reader = new WorkerReader(worker);
const writer = new WorkerWriter(worker);

await writer.write(encoder.encode("Hello"));
await writer.write(encoder.encode("World"));

for await (const data of Deno.iter(reader)) {
  const text = decoder.decode(data);
  console.log(text);
}
```

#### Worker

```typescript
import {
  WorkerReader,
  WorkerWriter,
} from "https://deno.land/x/workerio@$MODULE_VERSION/mod.ts";

const decoder = new TextDecoder();
const encoder = new TextEncoder();

async function main(): Promise<void> {
  const worker = self as unknown as Worker;
  const reader = new WorkerReader(worker);
  const writer = new WorkerWriter(worker);

  for await (const data of Deno.iter(reader)) {
    const text = decoder.decode(data);
    await writer.write(encoder.encode(`!!! ${text} !!!`));
  }
}

main().catch((e) => console.error(e));
```

## License

The code follows MIT license written in [LICENSE](./LICENSE). Contributors need
to agree that any modifications sent in this repository follow the license.
