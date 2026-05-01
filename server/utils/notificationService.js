const Notification = require('../models/Notification');
const User = require('../models/User');
const { userSockets } = require('../socket/socketHandler');

console.log('[NOTIF_SERVICE] Notification service loaded');

const getUserName = (user) => {
  if (!user) return 'Someone';
  if (typeof user === 'string') return 'Someone';
  return user.name || 'Someone';
};

const getUserId = (user) => {
  if (!user) return null;
  if (typeof user === 'string') return user;
  if (user._id) return user._id.toString();
  if (user.id) return user.id.toString();
  return null;
};

const getRecipientId = (recipient) => {
  if (!recipient) return null;
  if (typeof recipient === 'string') return recipient;
  if (recipient._id) return recipient._id.toString();
  if (recipient.id) return recipient.id.toString();
  return null;
};

const createNotification = async (data) => {
  const recipientId = getRecipientId(data.recipient);
  const senderId = getUserId(data.sender);
  
  if (!recipientId || !senderId) {
    console.log('[NOTIF] ERROR: Missing recipient or sender ID', { recipientId, senderId });
    return null;
  }
  
  const notification = await Notification.create({
    ...data,
    recipient: recipientId,
    sender: senderId
  });
  
  await notification.populate('sender', 'name email avatar');
  
  const io = global.io || require('../server').io;
  const socketId = userSockets.get(recipientId);
  
  console.log('[NOTIF] Created:', notification._id, 'For:', recipientId, 'Socket:', socketId);
  
  if (io && socketId) {
    io.to(socketId).emit('notification:new', notification);
    console.log('[NOTIF] Sent via socket to:', socketId);
  } else {
    console.log('[NOTIF] User offline, saved to DB. Connected sockets:', [...userSockets.keys()]);
  }
  
  return notification;
};

const extractMentions = (content) => {
  if (!content) return [];
  const mentionRegex = /@(\w+(?:\s+\w+)*)/g;
  const mentions = [];
  let match;
  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1]);
  }
  return [...new Set(mentions.map(m => m.toLowerCase()))];
};

const notifyMentionedUsers = async (content, sender, task, type) => {
  const senderId = getUserId(sender);
  if (!senderId) return;
  
  const mentionNames = extractMentions(content);
  if (mentionNames.length === 0) return;
  
  console.log('[MENTION] Looking for users:', mentionNames, 'sender:', senderId);
  
  const users = await User.find({
    name: { $regex: new RegExp(`^(${mentionNames.join('|')})$`, 'i') }
  });
  
  console.log('[MENTION] Found users:', users.map(u => `${u.name} (${u._id})`));
  
  for (const user of users) {
    const userId = user._id.toString();
    if (userId === senderId) {
      console.log('[MENTION] Skipping sender');
      continue;
    }
    
    console.log('[MENTION] Creating notification for:', user.name);
    
    await createNotification({
      recipient: userId,
      sender: senderId,
      type: 'mention',
      message: `${getUserName(sender)} mentioned you in "${task.title}"`,
      link: `/projects/${task.project}/tasks/${task._id}`,
      relatedTask: task._id,
      relatedProject: task.project
    });
  }
};

const notifyTaskAssigned = async (task, assigner, assignee) => {
  const assignerId = getUserId(assigner);
  const assigneeId = getRecipientId(assignee);
  
  if (!assignerId || !assigneeId) return;
  if (assigneeId === assignerId) return;
  
  console.log('[TASK_ASSIGNED] Notifying:', assigneeId, 'from:', assignerId);
  
  await createNotification({
    recipient: assigneeId,
    sender: assignerId,
    type: 'task_assigned',
    message: `${getUserName(assigner)} assigned you to "${task.title}"`,
    link: `/projects/${task.project}/tasks/${task._id}`,
    relatedTask: task._id,
    relatedProject: task.project
  });
};

const notifyCommentAdded = async (task, commenter, taskMembers, content) => {
  const commenterId = getUserId(commenter);
  if (!commenterId) return;
  
  console.log('[COMMENT] Notifying assignees about comment from:', commenterId);
  
  const mentions = extractMentions(content);
  console.log('[COMMENT] Mentions in comment:', mentions);
  
  // Handle both single assignee (object/string) and array
  let assigneeIds = [];
  if (task.assignees) {
    if (Array.isArray(task.assignees)) {
      assigneeIds = task.assignees.map(a => a.toString());
    } else {
      assigneeIds = [task.assignees.toString()];
    }
  }
  
  for (const memberId of assigneeIds) {
    if (memberId === commenterId) continue;
    
    console.log('[COMMENT] Creating notification for assignee:', memberId);
    
    await createNotification({
      recipient: memberId,
      sender: commenterId,
      type: 'comment_added',
      message: `${getUserName(commenter)} commented on "${task.title}"`,
      link: `/projects/${task.project}/tasks/${task._id}`,
      relatedTask: task._id,
      relatedProject: task.project
    });
  }
  
  if (mentions.length > 0) {
    await notifyMentionedUsers(content, commenter, task, 'comment');
  }
};

const notifyMemberInvited = async (project, inviter, invitee) => {
  const inviterId = getUserId(inviter);
  const inviteeId = getRecipientId(invitee);
  
  if (!inviterId || !inviteeId) return;
  
  console.log('[INVITE] Notifying:', inviteeId);
  
  await createNotification({
    recipient: inviteeId,
    sender: inviterId,
    type: 'member_invited',
    message: `${getUserName(inviter)} invited you to join "${project.name}"`,
    link: `/projects/${project._id}`,
    relatedProject: project._id
  });
};

const notifyTaskStatusChanged = async (task, changer, previousStatus) => {
  const changerId = getUserId(changer);
  if (!changerId) return;
  
  console.log('[STATUS] Notifying assignees about status change from:', changerId);
  
  let assigneeIds = [];
  if (task.assignees) {
    if (Array.isArray(task.assignees)) {
      assigneeIds = task.assignees.map(a => a.toString());
    } else {
      assigneeIds = [task.assignees.toString()];
    }
  }
  
  for (const memberId of assigneeIds) {
    if (memberId === changerId) continue;
    
    await createNotification({
      recipient: memberId,
      sender: changerId,
      type: 'task_status_changed',
      message: `${getUserName(changer)} changed status of "${task.title}" from ${previousStatus} to ${task.status}`,
      link: `/projects/${task.project}/tasks/${task._id}`,
      relatedTask: task._id,
      relatedProject: task.project
    });
  }
};

module.exports = {
  createNotification,
  notifyTaskAssigned,
  notifyCommentAdded,
  notifyMemberInvited,
  notifyTaskStatusChanged,
  notifyMentionedUsers
};