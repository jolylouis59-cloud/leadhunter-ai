export const OPEN_TRY_LUCK_EVENT = "leadhunter:open-try-luck";

export function openTryLuckModal() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(OPEN_TRY_LUCK_EVENT));
  }
}
