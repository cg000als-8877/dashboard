import { parseISO, getDay } from 'date-fns';

export const BANGLADESH_HOLIDAYS = {
  '08-05': {
    title: "July Mass Uprising Day",
    subtitle: "Student-People's Uprising Day",
    description: "August 5 is observed annually in Bangladesh as July Mass Uprising Day (Student-People's Uprising Day), a nationwide public holiday.",
    type: 'national',
    icon: '🇧🇩'
  },
  '12-16': {
    title: "Victory Day",
    subtitle: "Bijoy Dibosh",
    description: "December 16 is Victory Day in Bangladesh, celebrating national independence and victory.",
    type: 'national',
    icon: '🇧🇩'
  },
  '03-26': {
    title: "Independence Day",
    subtitle: "Shadhinota Dibosh",
    description: "March 26 is Bangladesh Independence Day.",
    type: 'national',
    icon: '🇧🇩'
  },
  '02-21': {
    title: "International Mother Language Day",
    subtitle: "Shaheed Dibosh",
    description: "February 21 commemorates the Language Movement Martyrs.",
    type: 'national',
    icon: '🌺'
  },
  '04-14': {
    title: "Pohela Boishakh",
    subtitle: "Bengali New Year",
    description: "Celebration of the Bengali New Year.",
    type: 'national',
    icon: '🎨'
  },
  '05-01': {
    title: "May Day",
    subtitle: "International Workers' Day",
    description: "May 1 is International Workers' Day, honoring labor rights.",
    type: 'national',
    icon: '⚒️'
  }
};

export function getHolidayInfo(dateStr) {
  if (!dateStr) return null;
  
  try {
    const parsed = parseISO(dateStr);
    const dayOfWeek = getDay(parsed); // 0 = Sun, 5 = Fri, 6 = Sat
    const isFriday = dayOfWeek === 5;
    
    const monthDay = dateStr.substring(5); // "MM-DD"
    const specialHoliday = BANGLADESH_HOLIDAYS[monthDay];

    if (specialHoliday) {
      return {
        isHoliday: true,
        isFriday,
        ...specialHoliday
      };
    }

    if (isFriday) {
      return {
        isHoliday: true,
        isFriday: true,
        title: "Weekly Factory Holiday",
        subtitle: "Scheduled Rest Day (Friday)",
        description: "Fridays are the scheduled weekly holiday for factory workers and floor operations. Production lines are closed today.",
        type: 'weekly',
        icon: '🕌'
      };
    }

    return null;
  } catch (e) {
    return null;
  }
}
