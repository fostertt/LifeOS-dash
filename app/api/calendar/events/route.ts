import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getCalendarClient } from '@/lib/google-calendar';

export interface CalendarEvent {
  id: string;
  source: 'google' | 'lifeos';
  calendarId: string;
  calendarName: string;
  calendarColor?: string;
  title: string;
  description?: string;
  location?: string;
  startTime: string;
  endTime: string;
  isAllDay: boolean;
  timezone: string;
  htmlLink?: string;
}

// GET /api/calendar/events?startDate=2025-11-19&endDate=2025-11-25
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate are required' },
        { status: 400 }
      );
    }

    // Parse dates
    const timeMin = new Date(startDate);
    const timeMax = new Date(endDate);
    timeMax.setHours(23, 59, 59, 999);

    // Get enabled calendars
    const enabledCalendars = await prisma.calendarSync.findMany({
      where: {
        userId: session.user.id,
        isEnabled: true,
      },
    });

    const googleEvents: CalendarEvent[] = [];

    // Only attempt Google Calendar fetch when a calendar is enabled
    if (enabledCalendars.length > 0) {
      const calendar = await getCalendarClient();

      await Promise.all(
        enabledCalendars.map(async (calendarSync) => {
          try {
            const response = await calendar.events.list({
              calendarId: calendarSync.calendarId,
              timeMin: timeMin.toISOString(),
              timeMax: timeMax.toISOString(),
              singleEvents: true,
              orderBy: 'startTime',
            });

            const events = response.data.items || [];

            events.forEach((event) => {
              if (!event.id || !event.start || !event.end) return;

              const isAllDay = !!event.start.date;
              const startTime = event.start.dateTime || event.start.date || '';
              const endTime = event.end.dateTime || event.end.date || '';

              googleEvents.push({
                id: event.id,
                source: 'google',
                calendarId: calendarSync.calendarId,
                calendarName: calendarSync.calendarName,
                calendarColor: calendarSync.color || undefined,
                title: event.summary || 'Untitled Event',
                description: event.description || undefined,
                location: event.location || undefined,
                startTime,
                endTime,
                isAllDay,
                timezone: event.start.timeZone || 'America/New_York',
                htmlLink: event.htmlLink || undefined,
              });
            });
          } catch (error) {
            console.error(
              `Error fetching events from calendar ${calendarSync.calendarName}:`,
              error
            );
          }
        })
      );
    }

    // Fetch Life OS events from database
    const lifeOSEvents = await prisma.calendarEvent.findMany({
      where: {
        userId: session.user.id,
        startTime: {
          gte: timeMin,
          lte: timeMax,
        },
      },
    });

    const lifeOSFormattedEvents: CalendarEvent[] = lifeOSEvents.map((event) => ({
      id: event.id.toString(),
      source: 'lifeos',
      calendarId: event.googleCalendarId || 'lifeos',
      calendarName: 'Life OS',
      calendarColor: '#8B5CF6',
      title: event.title,
      description: event.description || undefined,
      location: event.location || undefined,
      startTime: event.startTime.toISOString(),
      endTime: event.endTime.toISOString(),
      isAllDay: event.isAllDay,
      timezone: event.timezone,
    }));

    // Combine and sort events
    const allEvents = [...googleEvents, ...lifeOSFormattedEvents].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    return NextResponse.json(allEvents);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      calendarId,
      title,
      description,
      location,
      startTime,
      endTime,
      isAllDay,
    } = body;

    if (!calendarId || !title || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required event fields' },
        { status: 400 }
      );
    }

    if (calendarId !== 'lifeos') {
      // Create Google Calendar event
      const calendar = await getCalendarClient();
      const event = {
        summary: title,
        description: description,
        location: location,
        start: {
          dateTime: isAllDay ? undefined : new Date(startTime).toISOString(),
          date: isAllDay ? new Date(startTime).toISOString().split('T')[0] : undefined,
          timeZone: 'America/New_York',
        },
        end: {
          dateTime: isAllDay ? undefined : new Date(endTime).toISOString(),
          date: isAllDay ? new Date(endTime).toISOString().split('T')[0] : undefined,
          timeZone: 'America/New_York',
        },
      };

      const createdEvent = await calendar.events.insert({
        calendarId: calendarId,
        requestBody: event,
      });

      const calendarSync = await prisma.calendarSync.findFirst({
        where: { calendarId: calendarId, userId: session.user.id },
      });

      const result: CalendarEvent = {
        id: createdEvent.data.id!,
        source: 'google',
        calendarId: calendarId,
        calendarName: calendarSync?.calendarName || 'Google Calendar',
        calendarColor: calendarSync?.color || undefined,
        title: createdEvent.data.summary || 'Untitled Event',
        description: createdEvent.data.description || undefined,
        location: createdEvent.data.location || undefined,
        startTime: createdEvent.data.start?.dateTime || createdEvent.data.start?.date || '',
        endTime: createdEvent.data.end?.dateTime || createdEvent.data.end?.date || '',
        isAllDay: !!createdEvent.data.start?.date,
        timezone: createdEvent.data.start?.timeZone || 'America/New_York',
        htmlLink: createdEvent.data.htmlLink || undefined,
      };
      return NextResponse.json(result, { status: 201 });
    } else {
      // Create Life OS event
      const newLifeOSEvent = await prisma.calendarEvent.create({
        data: {
          userId: session.user.id,
          title,
          description,
          location,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          isAllDay,
          timezone: 'America/New_York', // Or derive from user settings
        },
      });

      const result: CalendarEvent = {
        id: newLifeOSEvent.id.toString(),
        source: 'lifeos',
        calendarId: 'lifeos',
        calendarName: 'Life OS',
        calendarColor: '#8B5CF6',
        title: newLifeOSEvent.title,
        description: newLifeOSEvent.description || undefined,
        location: newLifeOSEvent.location || undefined,
        startTime: newLifeOSEvent.startTime.toISOString(),
        endTime: newLifeOSEvent.endTime.toISOString(),
        isAllDay: newLifeOSEvent.isAllDay,
        timezone: newLifeOSEvent.timezone,
      };
      return NextResponse.json(result, { status: 201 });
    }
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to create calendar event' },
      { status: 500 }
    );
  }
}
