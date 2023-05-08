/**
 * Options for creating a writable stream from a worker.
 */
export type WritableStreamFromWorkerOptions = {
  /**
   * The queuing strategy to create the `WritableStream` with.
   */
  strategy?: QueuingStrategy<Uint8Array>;
};

/**
 * Creates a `WritableStream` that writes data to a `Worker` through `Worker.postMessage`.
 *
 * @param worker The `Worker` to write data to.
 * @returns A new `WritableStream` instance.
 */
export function writableStreamFromWorker(
  worker: Worker,
  options: WritableStreamFromWorkerOptions = {},
): WritableStream<Uint8Array> {
  const {
    strategy = new ByteLengthQueuingStrategy({ highWaterMark: 1024 }),
  } = options;
  return new WritableStream({
    /**
     * Writes a chunk of data to the `Worker` through `Worker.postMessage`.
     * @param chunk The data chunk to write to the `Worker`.
     * @param controller The `WritableStreamDefaultController` to manage the write operation.
     */
    write(chunk, controller) {
      try {
        worker.postMessage(chunk, [chunk.buffer]);
      } catch (e) {
        controller.error(e);
      }
    },
    /**
     * Notifies the `Worker` that the writable stream has finished writing, by sending a `null` message.
     */
    close() {
      worker.postMessage(null);
    },
  }, strategy);
}
