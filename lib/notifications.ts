/**
 * Notification Service
 * Handles email, SMS, and push notifications
 */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Remotive Logistics <noreply@remotivelogistics.com>';

export interface NotificationData {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

/**
 * Send email notification
 */
export async function sendEmailNotification(data: NotificationData): Promise<boolean> {
  try {
    // Remove quotes from FROM_EMAIL if present
    const cleanFromEmail = FROM_EMAIL.replace(/^["']|["']$/g, '');

    await resend.emails.send({
      from: cleanFromEmail,
      to: data.to,
      subject: data.subject,
      html: data.html,
      text: data.text,
    });

    console.log(`✅ Email sent to ${data.to}: ${data.subject}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return false;
  }
}

/**
 * Send new lead assignment notification
 */
export async function notifyNewLeadAssigned(params: {
  repEmail: string;
  repName: string;
  leadName: string;
  leadPhone: string | null;
  leadEmail: string | null;
  leadScore: number;
  temperature: string;
  trailerSize?: string | null;
}) {
  const { repEmail, repName, leadName, leadPhone, leadEmail, leadScore, temperature, trailerSize } = params;

  const temperatureEmoji = {
    hot: '🔥',
    warm: '🌡️',
    cold: '❄️',
    dead: '💀',
  }[temperature] || '📊';

  const subject = `${temperatureEmoji} New Lead Assigned: ${leadName} (Score: ${leadScore})`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #E96114; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .lead-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${temperature === 'hot' ? '#EF4444' : '#E96114'}; }
        .score { font-size: 32px; font-weight: bold; color: ${leadScore >= 70 ? '#EF4444' : '#E96114'}; }
        .btn { display: inline-block; background: #E96114; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
        .info-row { margin: 10px 0; }
        .label { font-weight: bold; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎯 New Lead Assigned!</h1>
          <p>Hi ${repName}, you have a new lead waiting for you.</p>
        </div>
        <div class="content">
          <div class="lead-card">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <h2 style="margin: 0;">${leadName}</h2>
                <p style="color: #666; margin: 5px 0;">Lead Score: <span class="score">${leadScore}</span></p>
              </div>
              <div style="text-align: center;">
                <div style="background: ${temperature === 'hot' ? '#FEE2E2' : '#FED7AA'}; padding: 10px 20px; border-radius: 8px;">
                  <div style="font-size: 24px;">${temperatureEmoji}</div>
                  <div style="font-size: 12px; font-weight: bold; text-transform: uppercase;">${temperature}</div>
                </div>
              </div>
            </div>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">

            <div class="info-row">
              <span class="label">📞 Phone:</span> ${leadPhone || 'Not provided'}
            </div>
            ${leadEmail ? `<div class="info-row"><span class="label">📧 Email:</span> ${leadEmail}</div>` : ''}
            ${trailerSize ? `<div class="info-row"><span class="label">🚛 Trailer:</span> ${trailerSize}</div>` : ''}

            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">

            <div style="text-align: center;">
              <a href="[domain TBD]/en/crm/pipeline" class="btn">View in CRM 🚀</a>
            </div>
          </div>

          <div style="padding: 20px; background: white; border-radius: 8px; margin-top: 20px;">
            <h3>⚡ Quick Actions</h3>
            <p>Best practices for ${temperature} leads:</p>
            <ul>
              ${temperature === 'hot' ? '<li><strong>Call within 5 minutes</strong> - Hot leads need immediate attention!</li>' : ''}
              ${temperature === 'hot' ? '<li>Have pricing ready</li>' : ''}
              ${temperature === 'warm' ? '<li>Call within 1 hour</li>' : ''}
              ${temperature === 'warm' ? '<li>Send follow-up email with trailer options</li>' : ''}
              <li>Log your activity in the CRM</li>
              <li>Schedule next follow-up</li>
            </ul>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
New Lead Assigned: ${leadName}

Score: ${leadScore} | Temperature: ${temperature}
Phone: ${leadPhone || 'Not provided'}
${leadEmail ? `Email: ${leadEmail}` : ''}
${trailerSize ? `Trailer: ${trailerSize}` : ''}

View in CRM: [domain TBD]/en/crm/pipeline
  `;

  return sendEmailNotification({
    to: repEmail,
    subject,
    html,
    text,
  });
}

/**
 * Send status change notification
 */
export async function notifyStatusChange(params: {
  repEmail: string;
  repName: string;
  leadName: string;
  oldStatus: string;
  newStatus: string;
  changedBy: string;
}) {
  const { repEmail, repName, leadName, oldStatus, newStatus, changedBy } = params;

  const subject = `Status Update: ${leadName} moved to ${newStatus.toUpperCase()}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #09213C; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .status-change { background: white; padding: 20px; border-radius: 8px; text-align: center; }
        .status-badge { display: inline-block; padding: 8px 16px; border-radius: 6px; margin: 0 10px; font-weight: bold; text-transform: uppercase; }
        .arrow { font-size: 24px; margin: 0 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔄 Status Update</h1>
          <p>Hi ${repName}, a lead status has changed.</p>
        </div>
        <div class="content">
          <div class="status-change">
            <h2>${leadName}</h2>
            <div style="margin: 30px 0; display: flex; align-items: center; justify-content: center;">
              <span class="status-badge" style="background: #ddd; color: #666;">${oldStatus}</span>
              <span class="arrow">→</span>
              <span class="status-badge" style="background: #E96114; color: white;">${newStatus}</span>
            </div>
            <p style="color: #666;">Changed by: ${changedBy}</p>
            <a href="[domain TBD]/en/crm/pipeline" style="display: inline-block; background: #E96114; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">View Pipeline</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmailNotification({
    to: repEmail,
    subject,
    html,
  });
}

/**
 * Send stale lead warning to manager
 */
export async function notifyStaleLeads(params: {
  managerEmail: string;
  managerName: string;
  staleLeads: Array<{
    leadName: string;
    repName: string;
    daysSinceContact: number;
    leadScore: number;
  }>;
}) {
  const { managerEmail, managerName, staleLeads } = params;

  const subject = `⚠️ ${staleLeads.length} Stale Leads Need Attention`;

  const leadsHtml = staleLeads.map(lead => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${lead.leadName}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${lead.repName}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">${lead.daysSinceContact} days</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; color: ${lead.leadScore >= 70 ? '#EF4444' : '#E96114'};">${lead.leadScore}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 700px; margin: 0 auto; padding: 20px; }
        .header { background: #F59E0B; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        table { width: 100%; background: white; border-radius: 8px; overflow: hidden; }
        th { background: #F3F4F6; padding: 12px; text-align: left; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Stale Lead Alert</h1>
          <p>Hi ${managerName}, you have ${staleLeads.length} leads with no activity in 7+ days.</p>
        </div>
        <div class="content">
          <table cellpadding="0" cellspacing="0">
            <thead>
              <tr>
                <th>Lead Name</th>
                <th>Assigned To</th>
                <th>Days Inactive</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              ${leadsHtml}
            </tbody>
          </table>
          <div style="text-align: center; margin-top: 20px;">
            <a href="[domain TBD]/en/crm/dashboard" style="display: inline-block; background: #F59E0B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Dashboard</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmailNotification({
    to: managerEmail,
    subject,
    html,
  });
}

/**
 * Send daily digest to manager
 */
export async function sendDailyDigest(params: {
  managerEmail: string;
  managerName: string;
  stats: {
    newLeadsToday: number;
    appliedToday: number;
    wonToday: number;
    hotLeads: number;
    staleLeads: number;
    teamActivity: Array<{ repName: string; activitiesCount: number }>;
  };
}) {
  const { managerEmail, managerName, stats } = params;

  const subject = `📊 Daily CRM Digest - ${new Date().toLocaleDateString()}`;

  const teamActivityHtml = stats.teamActivity.map(rep => `
    <tr>
      <td style="padding: 8px;">${rep.repName}</td>
      <td style="padding: 8px; text-align: center; font-weight: bold;">${rep.activitiesCount}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #09213C; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .stat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
        .stat-card { background: white; padding: 20px; border-radius: 8px; text-align: center; }
        .stat-value { font-size: 32px; font-weight: bold; color: #E96114; }
        .stat-label { color: #666; font-size: 14px; margin-top: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 Daily Digest</h1>
          <p>Hi ${managerName}, here's your team summary for ${new Date().toLocaleDateString()}.</p>
        </div>
        <div class="content">
          <div class="stat-grid">
            <div class="stat-card">
              <div class="stat-value">${stats.newLeadsToday}</div>
              <div class="stat-label">New Leads</div>
            </div>
            <div class="stat-card">
              <div class="stat-value" style="color: #10B981;">${stats.wonToday}</div>
              <div class="stat-label">Won Today</div>
            </div>
            <div class="stat-card">
              <div class="stat-value" style="color: #EF4444;">${stats.hotLeads}</div>
              <div class="stat-label">Hot Leads</div>
            </div>
            <div class="stat-card">
              <div class="stat-value" style="color: #F59E0B;">${stats.staleLeads}</div>
              <div class="stat-label">Needs Attention</div>
            </div>
          </div>

          ${stats.teamActivity.length > 0 ? `
          <div style="background: white; padding: 20px; border-radius: 8px; margin-top: 20px;">
            <h3>Team Activity Today</h3>
            <table style="width: 100%;">
              ${teamActivityHtml}
            </table>
          </div>
          ` : ''}

          <div style="text-align: center; margin-top: 20px;">
            <a href="[domain TBD]/en/crm/dashboard" style="display: inline-block; background: #E96114; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Full Dashboard</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmailNotification({
    to: managerEmail,
    subject,
    html,
  });
}
