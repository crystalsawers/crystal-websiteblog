export function sortPostsByDate<T extends { date?: string }>(
  posts: T[],
  dateField: keyof T,
): T[] {
  return posts
    .filter((post) => post[dateField])
    .sort((a, b) => {
      const dateA = new Date(a[dateField] as string);
      const dateB = new Date(b[dateField] as string);

      // console.log('Comparing dates:', a[dateField], dateA, 'vs', b[dateField], dateB);

      return dateB.getTime() - dateA.getTime(); // Sort by latest date first, already formatted in NZ time by formatDate
    });
}
