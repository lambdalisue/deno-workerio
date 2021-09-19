export type WorkerForWorkerReader = Pick<Worker, "onmessage" | "terminate">;
export type WorkerForWorkerWriter = Pick<Worker, "postMessage">;
