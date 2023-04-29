/**
 * Creates a `WritableStream` that writes data to a `Worker` through `Worker.postMessage`.
 *
 * @param worker The `Worker` to write data to.
 * @returns A new `WritableStream` instance.
 */
export function writableStreamFromWorker(
  worker: Worker,
): WritableStream<Uint8Array> {
  return new WritableStream({
    /**
     * Writes a chunk of data to the `Worker` through `Worker.postMessage`.
     * @param chunk The data chunk to write to the `Worker`.
     * @param controller The `WritableStreamDefaultController` to manage the write operation.
     */
    write(chunk, controller) {
      try {
        worker.postMessage(chunk);
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
  });
}
