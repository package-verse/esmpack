
export const sleep = (n, signal?: AbortSignal) => new Promise<void>((resolve, reject) => {
    const c = setTimeout(() => {
        if (signal?.aborted) {
            return;
        }
        resolve();
    }, n);
    signal?.addEventListener("abort", () => {
        reject("aborted");
        clearTimeout(c);
    });
});
