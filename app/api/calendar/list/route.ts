import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getCalendarClient } from '@/lib/google-calendar';

// GET /api/calendar/list - Fetch and sync user's Google Calendar list
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get Google Calendar client
    const calendar = await getCalendarClient();

    // Fetch calendar list from Google
    const response = await calendar.calendarList.list();
    const googleCalendars = response.data.items || [];

    // Sync calendars to database
    const syncedCalendars = await Promise.all(
      googleCalendars.map(async (cal) => {
        if (!cal.id) return null;

        const calendarSync = await prisma.calendarSync.upsert({
          where: {
            userId_calendarId: {
              userId: session.user.id,
              calendarId: cal.id,
            },
          },
          create: {
            userId: session.user.id,
            calendarId: cal.id,
            calendarName: cal.summary || 'Unnamed Calendar',
            isPrimary: cal.primary || false,
            color: cal.backgroundColor,
            isEnabled: true,
            lastSyncedAt: new Date(),
          },
          update: {
            calendarName: cal.summary || 'Unnamed Calendar',
            isPrimary: cal.primary || false,
            color: cal.backgroundColor,
            lastSyncedAt: new Date(),
          },
        });

        return calendarSync;
      })
    );

    const validCalendars = syncedCalendars.filter((cal) => cal !== null);

    return NextResponse.json(validCalendars);
  } catch (error) {
    console.error('Error fetching calendar list:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar list' },
      { status: 500 }
    );
  }
}

// PATCH /api/calendar/list - Toggle calendar enabled/disabled
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { calendarId, isEnabled } = body;

    if (!calendarId || typeof isEnabled !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Update calendar sync
    const updatedCalendar = await prisma.calendarSync.updateMany({
      where: {
        userId: session.user.id,
        calendarId: calendarId,
      },
      data: {
        isEnabled: isEnabled,
      },
    });

    if (updatedCalendar.count === 0) {
      return NextResponse.json(
        { error: 'Calendar not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating calendar:', error);
    return NextResponse.json(
      { error: 'Failed to update calendar' },
      { status: 500 }
    );
  }
}
