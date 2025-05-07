const generateTimeSlots = (start = "09:00", end = "17:00", interval = 30) => {
    const slots = [];
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);
    const startDate = new Date(0, 0, 0, startHour, startMinute);
    const endDate = new Date(0, 0, 0, endHour, endMinute);

    while (startDate < endDate) {
        slots.push(startDate.toTimeString().slice(0, 5)); // "HH:MM"
        startDate.setMinutes(startDate.getMinutes() + interval);
    }

    return slots;
};

module.exports = generateTimeSlots;