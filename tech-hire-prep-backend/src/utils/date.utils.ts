const DEFAULT_TIMEZONE = "Asia/Kolkata";

const istFormatter = new Intl.DateTimeFormat("sv-SE", {
    timeZone: DEFAULT_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
});

const englishFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
});


export const now = (
    dateOrIST: | Date | {
        date: string;
        time: string;
        iso?: string;
        istOffset?: string;
    } = new Date()
) => {
    const date = dateOrIST instanceof Date ? dateOrIST : new Date();
    const ist = dateOrIST instanceof Date ? undefined : dateOrIST;

    const istOffset = ist?.istOffset ?? "+05:30";

    const parts = Object.fromEntries(
        istFormatter
            .formatToParts(date)
            .filter(({ type }) => type !== "literal")
            .map(({ type, value }) => [type, value])
    );

    const englishParts = Object.fromEntries(
        englishFormatter
            .formatToParts(date)
            .filter(({ type }) => type !== "literal")
            .map(({ type, value }) => [type, value])
    );

    const milliseconds = String(date.getMilliseconds()).padStart(3, "0");

    const dateString = `${parts.year}-${parts.month}-${parts.day}`;
    const timeWithMin = `${parts.hour}:${parts.minute}`;
    const timeWithSec = `${parts.hour}:${parts.minute}:${parts.second}`;
    const timeWithMs = `${parts.hour}:${parts.minute}:${parts.second}.${milliseconds}`;

    const istTime = ist?.time
        ? ist.time.includes(".")
            ? ist.time
            : `${ist.time}.000`
        : timeWithMs;

    const istToUTC = ist
        ? new Date(`${ist.date}T${istTime}${istOffset}`)
        : date;

    const isoToUTC = ist?.iso
        ? new Date(ist.iso)
        : date;

    return {
        year: Number(parts.year),
        month: Number(parts.month),
        day: Number(parts.day),

        englishDate: englishFormatter.format(date),
        englishDay: englishParts.weekday ?? "",
        englishMonth: englishParts.month ?? "",

        hour: Number(parts.hour),
        minute: Number(parts.minute),
        second: Number(parts.second),
        millisecond: Number(milliseconds),

        date: dateString,
        timeWithMin,
        timeWithSec,
        timeWithMs,

        utc: new Date(date),
        iso: date.toISOString(),
        isoIST: `${dateString}T${timeWithMs}${istOffset}`,
        istOffset,

        // Always Date
        istToUTC,

        // Always Date
        isoToUTC,

        timestamp: date.getTime(),
    };
};


/**
 * Compare if event started
 */
export const hasStarted = (
    eventDate: Date | string | number
): boolean => {

    return Date.now() >= new Date(eventDate).getTime();
};


/**
 * Compare if event expired
 */
export const hasExpired = (
    expiryDate: Date | string | number
): boolean => {

    return Date.now() > new Date(expiryDate).getTime();
};


/**
 * Check current time between range
 */
export const isBetween = (
    start: Date | string | number,
    end: Date | string | number
): boolean => {

    const now = Date.now();

    return (
        now >= new Date(start).getTime() &&
        now <= new Date(end).getTime()
    );
};


/**
 * Same calendar day in IST
 */
export const isSameISTDay = (
    date: Date | string | number
): boolean => {

    const current = now();
    const compare = now(new Date(date));

    return (
        current.year === compare.year &&
        current.month === compare.month &&
        current.day === compare.day
    );
};


/**
 * Add minutes/hours/days preserving milliseconds
 */
export const addTime = (
    date: Date,
    options: {
        days?: number;
        hours?: number;
        minutes?: number;
        seconds?: number;
        milliseconds?: number;
    }
): Date => {

    const result = new Date(date);

    if (options.days)
        result.setDate(result.getDate() + options.days);

    if (options.hours)
        result.setHours(result.getHours() + options.hours);

    if (options.minutes)
        result.setMinutes(result.getMinutes() + options.minutes);

    if (options.seconds)
        result.setSeconds(result.getSeconds() + options.seconds);

    if (options.milliseconds)
        result.setMilliseconds(
            result.getMilliseconds() + options.milliseconds
        );

    return result;
};
