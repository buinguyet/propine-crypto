export const toTimestamp = (strDate: string) => {
  const datum = Date.parse(strDate);

  return datum / 1000;
};

export const addDayTimestamp = (timestamp: number) => {
  const extendTimstamp = timestamp + 24 * 60 * 60;

  return extendTimstamp;
};
