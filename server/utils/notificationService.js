const Notification = require('../models/Notification');
const { userSockets } = require('../socket/socketHandler');

const createNotification = async (data) => {
  const notification = await Notification.create(data);
  
  await notification.populate('sender', 'name email avatar');
  
  const io = global.io || require('../server').io;
  if (io && notification.recipient.toString()) {
    const recipientId = notification.recipient.toString();
    const socketId = userSockets.get(recipientId);
    if (socketId) {
      io.to(socketId).emit('notification:new', notification);
    }
  }
  
  return notification;
};

const notifyTaskAssigned = async (task, assigner, assignee) => {
  if (assignee.toString() === assigner.toString()) return;
  
  await createNotification({
    recipient: assignee,
    sender: assigner,
    type: 'task_assigned',
    message: `${assigner.name} assigned you to "${task.title}"`,
    link: `/projects/${task.project}/tasks/${task._id}`,
    relatedTask: task._id,
    relatedProject: task.project
  });
};

const notifyCommentAdded = async (task, commenter, taskMembers) => {
  const mentions = [];
  const content = task.comments[task.comments.length - 1]?.content || '';
  const mentionRegex = /@(\w+)/g;
  let match;
  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1]);
  }
  
  for (const member of taskMembers) {
    if (member.toString() === commenter.toString()) continue;
    
    const shouldNotify = task.assignees.some(a => a.toString() === member.toString()) || 
                        mentions.length > 0;
    
    if (shouldNotify) {
      await createNotification({
        recipient: member,
        sender: commenter,
        type: 'comment_added',
        message: `${commenter.name} commented on "${task.title}"`,
        link: `/projects/${task.project}/tasks/${task._id}`,
        relatedTask: task._id,
        relatedProject: task.project
      });
    }
  }
};

const notifyMemberInvited = async (project, inviter, invitee) => {
  await createNotification({
    recipient: invitee,
    sender: inviter,
    type: 'member_invited',
    message: `${inviter.name} invited you to join "${project.name}"`,
    link: `/projects/${project._id}`,
    relatedProject: project._id
  });
};

const notifyTaskStatusChanged = async (task, changer, previousStatus) => {
  for (const assignee of task.assignees) {
    if (assignee.toString() === changer.toString()) continue;
    
    await createNotification({
      recipient: assignee,
      sender: changer,
      type: 'task_status_changed',
      message: `${changer.name} changed status of "${task.title}" from ${previousStatus} to ${task.status}`,
      link: `/projects/${task.project}/tasks/${task._id}`,
      relatedTask: task._id,
      relatedProject: task.project
    });
  }
};

const notifyDueSoon = async (task, assignees) => {
  for (const assignee of assignees) {
    await createNotification({
      recipient: assignee,
      sender: task.createdBy,
      type: 'task_due',
      message: `"${task.title}" is due soon`,
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
  notifyDueSoon
};