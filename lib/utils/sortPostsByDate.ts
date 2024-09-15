export function sortPostsByDate<T extends { date?: string }>(posts: T[], dateField: keyof T, timeZone: string = 'Pacific/Auckland'): T[] {
  return posts
    .filter(post => post[dateField])
    .sort((a, b) => {
      const dateA = new Date(new Date(a[dateField] as string).toLocaleString('en-GB', { timeZone }));
      const dateB = new Date(new Date(b[dateField] as string).toLocaleString('en-GB', { timeZone }));
      return dateB.getTime() - dateA.getTime(); // Sort by latest date first
    });
}
