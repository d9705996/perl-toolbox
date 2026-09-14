export function severityAsText(severity: number): string {
  switch (parseInt(String(severity), 10)) {
    case 5:
      return 'gentle';
    case 4:
      return 'stern';
    case 3:
      return 'harsh';
    case 2:
      return 'cruel';
    default:
      return 'brutal';
  }
}

export function isValidViolation(violation: string): boolean {
  return violation.split('~|~').length === 6;
}
