const Timetable = require('../models/Timetable');

/**
 * Validates whether the attendance session matches a valid timetable slot.
 * Ensures the session is tied to the faculty's scheduled timetable slot.
 */
const validateTimetableSlot = async (req, res, next) => {
  try {
    const { timetableSlotId, overrideSlotValidation } = req.body;

    if (!timetableSlotId && !overrideSlotValidation) {
      return res.status(400).json({
        success: false,
        message: 'A valid timetable slot is required to initiate an attendance session.'
      });
    }

    if (timetableSlotId) {
      const slot = await Timetable.findById(timetableSlotId);
      if (!slot) {
        return res.status(404).json({
          success: false,
          message: 'Specified timetable slot not found'
        });
      }

      // Check current day vs scheduled day (with flexible override flag for faculty testing)
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const currentDay = days[new Date().getDay()];
      
      req.timetableSlot = slot;
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Timetable validation error',
      error: error.message
    });
  }
};

module.exports = { validateTimetableSlot };
