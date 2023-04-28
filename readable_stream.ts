const DEFAULT_CHUNK_SIZE = 16 * 1024;

/**
 * Options for creating a readable stream from a worker.
 */
export interface ReadableStreamFromWorkerOptions {
  /**
   * The size of chunks to allocate to read. The default is ~16KiB, which is
   * the maximum size that Deno operations can currently support.
   */
  chunkSize?: number;

  /**
   * The queuing strategy to create the `ReadableStream` with.
   */
  strategy?: {
    /**
     * A number representing the total number of bytes that can be stored in the
     * stream's internal queue before backpressure is applied.
     *
     * If not specified, it defaults to 1.
     */
    highWaterMark?: number | undefined;
    /**
     * This value should always be left undefined as the stream's underlying
     * source is the worker.
     */
    size?: undefined;
  };
}

/**
 * Creates a readable stream that reads data from a worker's `postMessage` event.
 *
 * @param worker The worker to read data from.
 * @param options The options to configure the behavior of the stream. Defaults to
 * 16 KiB chunk size and a queuing strategy with highWaterMark of 1 and undefined size.
 * @returns A readable stream that can be used to read the data.
 */
export function readableStreamFromWorker(
  worker: Worker,
  options: ReadableStreamFromWorkerOptions = {},
): ReadableStream<Uint8Array> {
  const {
    chunkSize = DEFAULT_CHUNK_SIZE,
    strategy,
  } = options;
  let onmessage: (e: MessageEvent<Uint8Array | null>) => void;
  return new ReadableStream({
    start(controller) {
      onmessage = (ev) => {
        if (ev.data === null) {
          worker.removeEventListener("message", onmessage);
          controller.close();
          return;
        } else if (ev.data instanceof Uint8Array) {
          const data = ev.data;
          let offset = 0;
          while (offset < data.length) {
            const end = offset + chunkSize;
            controller.enqueue(data.subarray(offset, end));
            offset = end;
          }
        } else {
          throw new Error("Unexpected data posted");
        }
      };
      worker.addEventListener("message", onmessage);
    },
    cancel() {
      worker.removeEventListener("message", onmessage);
    },
  }, strategy);
}
