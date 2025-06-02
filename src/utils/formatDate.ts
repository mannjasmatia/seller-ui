export const formatDateTime = (timestamp:string) => {
    return new Date(timestamp).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
    });
};

export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, '0'); // Ensures 2-digit format
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getUTCFullYear();

    return `${day}-${month}-${year}`;
};