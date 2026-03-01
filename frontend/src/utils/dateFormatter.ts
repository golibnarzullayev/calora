import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const uzbekDays = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba'];
const uzbekMonths = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];

export const formatDateWithDay = (date: string | Date): string => {
  const d = dayjs(date);
  const dayOfWeek = uzbekDays[d.day() === 0 ? 6 : d.day() - 1];
  const month = uzbekMonths[d.month()];
  return `${dayOfWeek}, ${d.date()} ${month}`;
};

export const formatDateWithTime = (date: string | Date): string => {
  const d = dayjs(date);
  const dayOfWeek = uzbekDays[d.day() === 0 ? 6 : d.day() - 1];
  const month = uzbekMonths[d.month()];
  const time = d.format('HH:mm');
  return `${dayOfWeek}, ${d.date()} ${month} ${time}`;
};

export const formatTimeOnly = (date: string | Date): string => {
  return dayjs(date).format('HH:mm');
};
