/**
 * A build's whole output is held in memory until the build finishes, so an
 * unusually chatty command would otherwise be able to exhaust the heap. Only the
 * tail is kept, because that is where a failure is diagnosed.
 */
export const buildLogLimit = 1024 * 1024;

const truncationNotice = '[... earlier output truncated ...]\n';

const contentLimit = buildLogLimit - truncationNotice.length;

export class BuildLog {
  #chunks: Array<string> = [];
  #length = 0;
  #truncated = false;

  append(chunk: string): void {
    this.#chunks.push(chunk);
    this.#length += chunk.length;
    while (this.#length > contentLimit) {
      this.#truncated = true;
      const oldest = this.#chunks[0]!;
      // A single chunk can exceed the budget on its own, so keep its tail
      // instead of dropping the only thing there is.
      if (this.#chunks.length === 1) {
        const kept = oldest.slice(oldest.length - contentLimit);
        this.#chunks[0] = kept;
        this.#length = kept.length;
        return;
      }
      this.#chunks.shift();
      this.#length -= oldest.length;
    }
  }

  toString(): string {
    const content = this.#chunks.join('');
    return this.#truncated ? `${truncationNotice}${content}` : content;
  }
}
