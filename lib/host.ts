// Produktions-Hosts. Alles andere (vorschau.b-t-m-m.com, *.vercel.app, localhost) wird nicht indexiert.
export const PROD_HOSTS = ['b-t-m-m.com', 'www.b-t-m-m.com']

export function istProdHost(host: string | null | undefined): boolean {
  if (!host) return false
  return PROD_HOSTS.includes(host.split(':')[0].toLowerCase())
}
