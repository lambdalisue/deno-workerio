# workerio-deno

[![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/deno.land/x/workerio/mod.ts)
[![Test](https://github.com/lambdalisue/workerio-deno/actions/workflows/test.yml/badge.svg)](https://github.com/lambdalisue/workerio-deno/actions/workflows/test.yml)

[Deno][deno] module to translate Worker's system of messages into
[Reader][reader] and [Writer][writer].

Note that `WorkerReader` and `WorkerWriter` access `Deno` namespace thus
[Using Deno in worker](https://deno.land/manual@v1.7.5/runtime/workers#using-deno-in-worker)
must be enabled.

[deno]: https://deno.land/
[reader]: https://doc.deno.land/builtin/stable#Deno.Reader
[writer]: https://doc.deno.land/builtin/stable#Deno.Writer

## Example

### Server

```typescript
import {
  WorkerReader,
  WorkerWriter,
} from "https://deno.land/x/workerio/mod.ts";

const decoder = new TextDecoder();
const encoder = new TextEncoder();

const worker = new Worker(
  new URL("./worker.ts", import.meta.url).href,
  {
    type: "module",
    // NOTE:
    // WorkerReader/WorkerWriter need to access 'Deno' namespace.
    deno: {
      namespace: true,
    },
  },
);

const reader = new WorkerReader(worker);
const writer = new WorkerWriter(worker);

await writer.write(encoder.encode("Hello"));
await writer.write(encoder.encode("World"));

for await (const data of Deno.iter(reader)) {
  const text = decoder.decode(data);
  console.log(text);
}
```

### Worker

```typescript
import {
  WorkerReader,
  WorkerWriter,
} from "https://deno.land/x/workerio/mod.ts";

const decoder = new TextDecoder();
const encoder = new TextEncoder();

async function main(): Promise<void> {
  // deno-lint-ignore no-explicit-any
  const worker = self as any;
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
