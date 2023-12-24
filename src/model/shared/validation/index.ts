export const isIdExist = <T extends { id: number }>(items: T[], id: T['id']): boolean => {
  return !!items.find(i => i.id === id);
};

export const isAllIdExist = <T extends { id: number }>(items: T[], ids: T['id'][]) => {
  const existingIds = new Set(items.map(u => u.id));
  return ids.every(id => existingIds.has(id));
};
