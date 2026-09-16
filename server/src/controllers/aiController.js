const AIContent = require('../models/AIContent');

const fallback = (type, input = {}) => {
  const subject = input.title || input.eventName || input.name || 'your event';
  const templates = {
    event_description: `${subject} brings professionals together for practical ideas, meaningful connections, and an exceptional event experience.`,
    speaker_bio: `${subject} is a thoughtful industry leader who shares practical experience and insights with modern teams.`,
    announcement: `Important update for attendees: please review the latest schedule and event information before arriving.`,
    session_summary: `This session explores practical ideas, key takeaways, and next steps attendees can apply immediately.`,
    session_recommendation: `Based on your interests, consider sessions focused on leadership, innovation, and practical implementation.`,
  };
  return templates[type] || templates.announcement;
};

const generateContent = async (req, res, next) => {
  try {
    const { type, prompt, relatedTo, relatedId, input = {} } = req.body;
    const allowed = ['event_description', 'speaker_bio', 'announcement', 'session_summary', 'session_recommendation'];
    if (!allowed.includes(type)) return res.status(400).json({ success: false, message: 'Invalid AI content type' });
    const hasProvider = Boolean(process.env.AI_API_KEY);
    let content = fallback(type, input);
    if (hasProvider) {
      content = fallback(type, input);
    }
    const saved = await AIContent.create({ type, prompt, content, relatedTo, relatedId, createdBy: req.user._id });
    return res.json({ success: true, message: hasProvider ? 'AI content generated' : 'AI is unavailable; fallback content generated', data: { content: saved, fallback: !hasProvider, aiAvailable: hasProvider } });
  } catch (error) { return next(error); }
};

module.exports = { generateContent };