const recipeDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "2-digit",
  timeZone: "UTC",
  year: "numeric",
});

export const formatRecipeDate = (value: string | number | Date) =>
  recipeDateFormatter.format(new Date(value));
