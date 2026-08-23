export function formatDate(dateStr) {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.slice(0, 10).split('-');
    return `${day}-${month}-${year}`;
}

export function formatTime(dateStr) {
    if (!dateStr) return '';
    return dateStr.slice(11, 16);
}
