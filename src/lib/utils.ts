export function getDaysInMonth(month: any, year: any) {
	// Convert month name to index (0 for January, 11 for December)
	const monthIndex = new Date(`${month} 1, ${year}`).getMonth();

	// Move to the next month, set day to 0 to get the last day of the target month
	return new Date(year, monthIndex + 1, 0).getDate();
}

export function currentMonth() {
	const currentDate = new Date();
	const monthNames = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	];

	const currentMonthName = monthNames[currentDate.getMonth()];
	return currentMonthName;
}

export function getYearAndMonth() {
	const currentDate = new Date();
	return currentDate.getFullYear() + '-' + (currentDate.getMonth() + 1);
}

export function getElapsedDaysInCurrentMonth() {
	const today = new Date();
	return today.getDate(); // Day of the month (1–31)
}
