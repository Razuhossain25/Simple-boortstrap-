const parse = (iso) => new Date(`${iso}T00:00:00`);

export const fmtDate = (iso) =>
  parse(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export const dayOf = (iso) => parse(iso).getDate();
export const monthOf = (iso) => parse(iso).toLocaleDateString("en-GB", { month: "short" });
