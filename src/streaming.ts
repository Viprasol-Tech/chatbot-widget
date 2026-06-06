import type { SendHandler, StreamHandler } from "./types.js";

/**
 * Adapt a plain {@link SendHandler} into a {@link StreamHandler} that
 * yields the whole reply as a single chunk. Lets the streaming code path
 * accept request/response handlers unchanged.
 */
export function toStreamHandler(send: SendHandler): StreamHandler {
  return async function* (text: string): AsyncGenerator<string> {
    const reply = await send(text);
    yield reply;
  };
}

/**
 * Split a string into word-sized chunks, useful for simulating a typing
 * stream from a static reply in demos and tests. Whitespace is preserved
 * by attaching it to the preceding word.
 */
export function chunkText(text: string): string[] {
  const matches = text.match(/\S+\s*/g);
  return matches ? [...matches] : [];
}

/**
 * Build a {@link StreamHandler} that streams a fixed reply word-by-word.
 * Handy for storybook-style demos without a backend.
 */
export function fakeStream(reply: string): StreamHandler {
  return async function* (): AsyncGenerator<string> {
    for (const chunk of chunkText(reply)) {
      yield chunk;
    }
  };
}

/**
 * Fully consume a stream, concatenating every chunk into the final string.
 * `onChunk` is invoked with the running accumulated text after each chunk,
 * which the widget uses to render the reply as it grows.
 */
export async function collectStream(
  stream: AsyncIterable<string>,
  onChunk?: (accumulated: string, chunk: string) => void,
): Promise<string> {
  let accumulated = "";
  for await (const chunk of stream) {
    accumulated += chunk;
    onChunk?.(accumulated, chunk);
  }
  return accumulated;
}
