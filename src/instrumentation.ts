export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startImapWorker } = await import("./lib/imap-worker");
    startImapWorker();
  }
}
