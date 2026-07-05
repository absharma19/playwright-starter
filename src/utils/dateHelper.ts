/**
 * DateHelper — mirrors the Hub project's date utilities, simplified for standalone use.
 *
 * Usage:
 *   const helper = new DateHelper();
 *   helper.today()                        // Date object for today
 *   helper.addDays(new Date(), 5)         // Date 5 days from now
 *   helper.format(new Date(), 'dd/MM/yyyy') // '24/03/2026'
 *   helper.resolveDate('today')           // today's Date
 *   helper.resolveDate('1d')              // tomorrow
 *   helper.resolveDate('2 months')        // 2 months from now
 */
export class DateHelper {
  today(): Date {
    return new Date();
  }

  addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  addYears(date: Date, years: number): Date {
    const result = new Date(date);
    result.setFullYear(result.getFullYear() + years);
    return result;
  }

  subtractDays(date: Date, days: number): Date {
    return this.addDays(date, -days);
  }

  /**
   * Formats a date.
   * @param date - The date to format
   * @param format - 'dd/MM/yyyy' | 'long' (e.g. "24 Mar 2026") | 'iso'
   */
  format(date: Date, formatType: 'dd/MM/yyyy' | 'long' | 'iso' = 'dd/MM/yyyy'): string {
    if (formatType === 'iso') {
      return date.toISOString().split('T')[0];
    }
    if (formatType === 'long') {
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    // dd/MM/yyyy
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  /**
   * Resolves relative date tokens to a Date object.
   * Supported tokens: 'today', '1d', '3d', '2 months', '1 year'
   */
  resolveDate(token: string): Date {
    const base = this.today();
    const lower = token.trim().toLowerCase();

    if (lower === 'today') return base;

    const dayMatch = lower.match(/^(\d+)d$/);
    if (dayMatch) return this.addDays(base, parseInt(dayMatch[1]));

    const monthMatch = lower.match(/^(\d+)\s+months?$/);
    if (monthMatch) return this.addMonths(base, parseInt(monthMatch[1]));

    const yearMatch = lower.match(/^(\d+)\s+years?$/);
    if (yearMatch) return this.addYears(base, parseInt(yearMatch[1]));

    throw new Error(`DateHelper.resolveDate: unrecognised token "${token}"`);
  }
}
