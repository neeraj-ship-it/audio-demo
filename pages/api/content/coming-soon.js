const ContentScheduler = require('../../../services/content-scheduler')

/**
 * GET /api/content/coming-soon
 * Returns next 7 days content schedule
 */

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const scheduler = new ContentScheduler()

    // Generate schedule for next 7 days
    const rawSchedule = scheduler.generateWeekSchedule()
    const formattedSchedule = scheduler.formatScheduleForUI(rawSchedule)

    // Filter out today (already in published section)
    const today = new Date().toISOString().split('T')[0]
    const upcomingSchedule = formattedSchedule.filter(day => day.date > today)

    res.status(200).json({
      success: true,
      schedule: upcomingSchedule,
      totalDays: upcomingSchedule.length,
      totalContent: upcomingSchedule.reduce((sum, day) => sum + day.content.length, 0)
    })

  } catch (error) {
    console.error('Error generating schedule:', error)
    res.status(500).json({
      error: 'Failed to generate schedule',
      details: error.message
    })
  }
}
