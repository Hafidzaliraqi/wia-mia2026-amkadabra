import "server-only";

// ================================================================
// PENGIRIMAN WHATSAPP lewat Fonnte (https://fonnte.com)
// Isi FONNTE_TOKEN dengan token perangkat dari dashboard Fonnte.
// Nomor pengirim harus sudah tersambung (scan QR) di Fonnte.
// ================================================================

export function waSiap(): boolean {
  return Boolean(process.env.FONNTE_TOKEN);
}

export async function kirimWa(nomor: string, pesan: string) {
  const isi = new FormData();
  isi.append("target", nomor);
  isi.append("message", pesan);
  isi.append("countryCode", "62");
  const respons = await fetch("https://api.fonnte.com/send", {
    method: "POST",
    headers: { Authorization: process.env.FONNTE_TOKEN! },
    body: isi,
    signal: AbortSignal.timeout(10_000),
  });
  const data = (await respons.json().catch(() => ({}))) as { status?: boolean; reason?: string };
  if (!respons.ok || data.status === false) {
    throw new Error(`WhatsApp gagal dikirim: ${data.reason ?? respons.status}`);
  }
}
