export const getNextId = (items: { id: number }[]) => {
  return items.length
    ? Math.max.apply(
        null,
        items.map(i => i.id),
      ) + 1
    : 1;
};

export const getItemById = <T extends { id: number }>(items: T[], id: T['id']) => {
  return items.find(i => i.id === id);
};
