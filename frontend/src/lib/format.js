// Change "PHP" and "en-PH" here to change the currency everywhere.
const money = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
});

// The server sends money as text such as "150.50".
export function formatMoney(value) {
  return money.format(Number(value));
}

// "2026-11-03" -> "Nov 3, 2026". We build the date from its parts
// so timezones can never shift it by a day.
export function formatDate(iso) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Today's date on the person's own clock, as "YYYY-MM-DD".
export function todayISO() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

// Income minus expenses, calculated in whole centavos to avoid decimal drift.
export function netAmount(income, expense) {
  const cents =
    Math.round(Number(income) * 100) - Math.round(Number(expense) * 100);
  return cents / 100;
}
