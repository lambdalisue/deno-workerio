/**
 * Options for creating a readable stream from a worker.
 */
export type ReadableStreamFromWorkerOptions = {
  /**
   * The queuing strategy to create the `ReadableStream` with.
   */
  strategy?: QueuingStrategy<Uint8Array>;
};

/**
 * Creates a readable stream that reads data from a worker's `postMessage` event.
 *
 * @param worker The worker to read data from.
 * @param options Options for creating the readable stream.
 * @returns A readable stream that can be used to read the data.
 */
export function readableStreamFromWorker(
  worker: Worker,
  options: ReadableStreamFromWorkerOptions = {},
): ReadableStream<Uint8Array> {
  const {
    strategy = new ByteLengthQueuingStrategy({ highWaterMark: 1024 }),
  } = options;
  return new ReadableStream({
    start(controller) {
      worker.onmessage = (ev) => {
        if (ev.data === null) {
          controller.close();
          worker.onmessage = () => undefined;
        } else if (ev.data instanceof Uint8Array) {
          controller.enqueue(ev.data);
        } else {
          throw new Error("Unexpected data posted");
        }
      };
    },
    cancel() {
      worker.onmessage = () => undefined;
    },
  }, strategy);
}
