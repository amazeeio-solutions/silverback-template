export function sprintf(format: string, ...args: unknown[]): string {
  return format.replace(/%([0-9]+\$)?[sd]/g, (match, order) => {
    if (order) {
      // Handle ordered replacements: %1$s, %2$s etc
      const i = parseInt(order, 10) - 1;
      return args[i]?.toString() || match;
    }
    // Handle simple replacements: %s, %d
    return (args.shift() || '').toString();
  });
}
