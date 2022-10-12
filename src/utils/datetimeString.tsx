/** Returns a human readable formatted datetime */
export function datetimeString(date: Date): string {
  const dateString = date.toLocaleString("fr-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const timeString = date.toLocaleTimeString("en-US");

  const dateTimeString = `${dateString}, ${timeString}`;

  return dateTimeString;
}
