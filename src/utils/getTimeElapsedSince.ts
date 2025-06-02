export function getTimeElapsedSince(dateStr: string): string {
    const inputDate = new Date(dateStr);
    const now = new Date();
  
    let years = now.getFullYear() - inputDate.getFullYear();
    let months = now.getMonth() - inputDate.getMonth();
  
    if (months < 0) {
      years -= 1;
      months += 12;
    }
  
    if (years <= 0) {
      return `${months} Month${months !== 1 ? 's' : ''}`;
    }
  
    return `${years} Year${years !== 1 ? 's' : ''} and ${months} Month${months !== 1 ? 's' : ''}`;
  }
  