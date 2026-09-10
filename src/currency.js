export function formatPrice(price, currency) {
  if (price === null || price === undefined || price === '') return 'Sin precio'
  const amount = new Intl.NumberFormat('es').format(price)
  return currency === 'PESOS' ? `$${amount} PESOS` : `$${amount} USD`
}
