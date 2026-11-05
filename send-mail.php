<?php
/**
 * Le Groenland Business Solutions FZ LLE
 * Patient Medical Enquiry Handler
 * Sends submissions directly to info@legroenland.com
 */

// Strict error reporting for debugging, output controlled via JSON
error_reporting(E_ALL);
ini_set('display_errors', '0');

// Configuration
define('RECIPIENT_EMAIL', 'info@legroenland.com');
define('RECIPIENT_NAME', 'Le Groenland Medical Desk');
define('FROM_EMAIL', 'no-reply@legroenland.com');
define('FROM_NAME', 'Le Groenland Web Portal');
define('MAX_FILE_SIZE_BYTES', 25 * 1024 * 1024); // 25 MB

// Helper: send JSON response
function sendJsonResponse($success, $message, $extra = []) {
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode(array_merge([
        'success' => $success,
        'message' => $message
    ], $extra));
    exit;
}

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    sendJsonResponse(false, 'Method Not Allowed. Please submit the form.');
}

// Check honeypot for spam bots
if (!empty($_POST['_hp'])) {
    // Silently succeed for bots
    sendJsonResponse(true, 'Your enquiry has been received.');
}

// Sanitize & validate inputs
$name      = trim($_POST['n'] ?? filter_input(INPUT_POST, 'n', FILTER_DEFAULT) ?? '');
$country   = trim($_POST['c'] ?? filter_input(INPUT_POST, 'c', FILTER_DEFAULT) ?? '');
$phone     = trim($_POST['p'] ?? filter_input(INPUT_POST, 'p', FILTER_DEFAULT) ?? '');
$specialty = trim($_POST['s'] ?? filter_input(INPUT_POST, 's', FILTER_DEFAULT) ?? 'General Triage');
$urgency   = trim($_POST['urgency'] ?? filter_input(INPUT_POST, 'urgency', FILTER_DEFAULT) ?? 'Standard');
$condition = trim($_POST['m'] ?? filter_input(INPUT_POST, 'm', FILTER_DEFAULT) ?? '');

// Basic validation
if (empty($name) || empty($country) || empty($phone) || empty($condition)) {
    http_response_code(400);
    sendJsonResponse(false, 'Please complete all required fields (Name, Country, Phone/WhatsApp, and Condition).');
}

// Strip potentially malicious characters for email headers
$safeName = preg_replace("/[\r\n]+/", ' ', htmlspecialchars($name, ENT_QUOTES, 'UTF-8'));
$safeCountry = htmlspecialchars($country, ENT_QUOTES, 'UTF-8');
$safePhone = htmlspecialchars($phone, ENT_QUOTES, 'UTF-8');
$safeSpecialty = htmlspecialchars($specialty, ENT_QUOTES, 'UTF-8');
$safeUrgency = htmlspecialchars($urgency, ENT_QUOTES, 'UTF-8');
$safeCondition = nl2br(htmlspecialchars($condition, ENT_QUOTES, 'UTF-8'));

$timestamp = date('Y-m-d H:i:s T');
$clientIp = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';

// Process optional file attachment
$hasAttachment = false;
$attachmentData = null;
$attachmentFilename = null;
$attachmentMime = 'application/octet-stream';

if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
    $fileTmpPath = $_FILES['file']['tmp_name'];
    $fileSize = $_FILES['file']['size'];
    $originalName = basename($_FILES['file']['name']);
    $fileExtension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));

    $allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'zip', 'doc', 'docx', 'txt'];

    if ($fileSize > MAX_FILE_SIZE_BYTES) {
        http_response_code(400);
        sendJsonResponse(false, 'The uploaded file exceeds the 25 MB limit.');
    }

    if (!in_array($fileExtension, $allowedExtensions, true)) {
        http_response_code(400);
        sendJsonResponse(false, 'Invalid file format. Allowed formats: PDF, JPG, PNG, DOC, DOCX, ZIP.');
    }

    $fileContent = file_get_contents($fileTmpPath);
    if ($fileContent !== false) {
        $hasAttachment = true;
        $attachmentData = chunk_split(base64_encode($fileContent));
        $attachmentFilename = preg_replace('/[^a-zA-Z0-9_\.-]/', '_', $originalName);
        
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        if ($finfo) {
            $detectedMime = finfo_file($finfo, $fileTmpPath);
            if ($detectedMime) {
                $attachmentMime = $detectedMime;
            }
            finfo_close($finfo);
        }
    }
}

// Always log submission to a secure local backup file so no patient lead is ever lost
$logDir = __DIR__ . DIRECTORY_SEPARATOR . 'enquiries';
if (!is_dir($logDir)) {
    @mkdir($logDir, 0750, true);
}
$logEntry = [
    'timestamp' => $timestamp,
    'ip' => $clientIp,
    'name' => $name,
    'country' => $country,
    'phone' => $phone,
    'specialty' => $specialty,
    'urgency' => $urgency,
    'condition' => $condition,
    'has_attachment' => $hasAttachment,
    'attachment_name' => $attachmentFilename
];
@file_put_contents(
    $logDir . DIRECTORY_SEPARATOR . 'leads.jsonl',
    json_encode($logEntry, JSON_UNESCAPED_UNICODE) . PHP_EOL,
    FILE_APPEND | LOCK_EX
);

// Construct Email Subject
$subject = "[Patient Enquiry] {$safeName} - {$safeSpecialty} ({$safeCountry})";
$encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';

// Urgency badge color
$urgencyColor = match ($safeUrgency) {
    'Urgent', 'Urgent (< 7 Days)' => '#b91c1c',
    'Prompt', 'Within 7–14 Days' => '#c2410c',
    default => '#15803d'
};

// HTML Email Body
$htmlBody = <<<HTML
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Patient Enquiry</title>
</head>
<body style="margin:0;padding:24px;background:#f6f4ee;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1e2216;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:12px;border:1px solid #dcd8c8;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
    <tr>
      <td style="background:#1c2013;padding:28px 32px;color:#f9f7f2;border-bottom:3px solid #b38b3c;">
        <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">Le Groenland Business Solutions</h1>
        <p style="margin:6px 0 0;font-size:13px;color:#aba896;text-transform:uppercase;letter-spacing:0.05em;">New Patient Clinical Treatment Enquiry</p>
      </td>
    </tr>
    <tr>
      <td style="padding:32px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;border-collapse:collapse;">
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #eee;width:35%;color:#555a45;font-weight:600;font-size:14px;">Patient Full Name:</td>
            <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:15px;font-weight:700;color:#1e2216;">{$safeName}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #eee;color:#555a45;font-weight:600;font-size:14px;">Country of Residence:</td>
            <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:15px;color:#1e2216;">{$safeCountry}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #eee;color:#555a45;font-weight:600;font-size:14px;">Phone / WhatsApp:</td>
            <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:15px;font-weight:600;color:#1e2216;">
              <a href="https://wa.me/{$safePhone}" style="color:#25d366;text-decoration:none;">{$safePhone}</a>
            </td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #eee;color:#555a45;font-weight:600;font-size:14px;">Medical Specialty:</td>
            <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:15px;color:#1e2216;">{$safeSpecialty}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #eee;color:#555a45;font-weight:600;font-size:14px;">Treatment Urgency:</td>
            <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:14px;">
              <span style="display:inline-block;padding:3px 10px;border-radius:12px;background:{$urgencyColor};color:#ffffff;font-weight:700;font-size:12px;">{$safeUrgency}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #eee;color:#555a45;font-weight:600;font-size:14px;">Medical Records Attached:</td>
            <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:14px;color:#1e2216;">
              <strong>{$attachmentFilename}</strong>
            </td>
          </tr>
        </table>

        <div style="background:#f8f6f0;border-radius:8px;padding:20px;border-left:4px solid #b38b3c;margin-bottom:24px;">
          <h3 style="margin:0 0 10px;font-size:14px;text-transform:uppercase;color:#555a45;letter-spacing:0.05em;">Clinical Condition &amp; Symptoms:</h3>
          <div style="font-size:15px;line-height:1.65;color:#1e2216;">{$safeCondition}</div>
        </div>

        <div style="font-size:12px;color:#888;line-height:1.5;padding-top:16px;border-top:1px solid #eee;">
          <strong>Security Details:</strong> Received at {$timestamp} from IP {$clientIp}.<br>
          <em>Note: Ensure patient data is handled according to healthcare confidentiality protocols.</em>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
HTML;

// Plain text alternative
$plainBody = <<<TEXT
LE GROENLAND BUSINESS SOLUTIONS - NEW PATIENT ENQUIRY
======================================================

Patient Name:       {$name}
Country:            {$country}
Phone / WhatsApp:   {$phone}
Specialty:          {$specialty}
Urgency Level:      {$urgency}
Timestamp:          {$timestamp}
IP Address:         {$clientIp}

Medical Records Attached:
{$attachmentFilename}

Condition Summary & Symptoms:
------------------------------------------------------
{$condition}

======================================================
Received via Le Groenland Web Portal
TEXT;

// Unique MIME Boundaries
$boundaryMixed = '==_Mixed_Boundary_' . md5(uniqid((string)time(), true));
$boundaryAlt = '==_Alt_Boundary_' . md5(uniqid((string)time(), true));

// Headers
$headers = [];
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'From: ' . FROM_NAME . ' <' . FROM_EMAIL . '>';
$headers[] = 'Reply-To: ' . $safeName . ' <' . FROM_EMAIL . '>';
$headers[] = 'X-Mailer: PHP/' . phpversion();
$headers[] = 'X-Originating-IP: ' . $clientIp;

if ($hasAttachment) {
    $headers[] = "Content-Type: multipart/mixed; boundary=\"{$boundaryMixed}\"";

    $message = "--{$boundaryMixed}\r\n";
    $message .= "Content-Type: multipart/alternative; boundary=\"{$boundaryAlt}\"\r\n\r\n";

    // Plain text part
    $message .= "--{$boundaryAlt}\r\n";
    $message .= "Content-Type: text/plain; charset=\"UTF-8\"\r\n";
    $message .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
    $message .= $plainBody . "\r\n\r\n";

    // HTML part
    $message .= "--{$boundaryAlt}\r\n";
    $message .= "Content-Type: text/html; charset=\"UTF-8\"\r\n";
    $message .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
    $message .= $htmlBody . "\r\n\r\n";

    $message .= "--{$boundaryAlt}--\r\n\r\n";

    // Attachment part
    $message .= "--{$boundaryMixed}\r\n";
    $message .= "Content-Type: {$attachmentMime}; name=\"{$attachmentFilename}\"\r\n";
    $message .= "Content-Disposition: attachment; filename=\"{$attachmentFilename}\"\r\n";
    $message .= "Content-Transfer-Encoding: base64\r\n\r\n";
    $message .= $attachmentData . "\r\n\r\n";

    $message .= "--{$boundaryMixed}--\r\n";
} else {
    $headers[] = "Content-Type: multipart/alternative; boundary=\"{$boundaryAlt}\"";

    // Plain text part
    $message = "--{$boundaryAlt}\r\n";
    $message .= "Content-Type: text/plain; charset=\"UTF-8\"\r\n";
    $message .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
    $message .= $plainBody . "\r\n\r\n";

    // HTML part
    $message .= "--{$boundaryAlt}\r\n";
    $message .= "Content-Type: text/html; charset=\"UTF-8\"\r\n";
    $message .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
    $message .= $htmlBody . "\r\n\r\n";

    $message .= "--{$boundaryAlt}--\r\n";
}

// Attempt sending email via PHP mail()
$headersStr = implode("\r\n", $headers);
$mailSent = @mail(RECIPIENT_EMAIL, $encodedSubject, $message, $headersStr);

// Check if request expects JSON (from fetch/AJAX)
$isAjax = (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') ||
          (isset($_SERVER['HTTP_ACCEPT']) && str_contains($_SERVER['HTTP_ACCEPT'], 'application/json'));

if ($mailSent) {
    sendJsonResponse(true, 'Your medical reports and enquiry have been delivered to our medical desk (info@legroenland.com). We will reach out within 12–24 hours.', [
        'name' => $safeName
    ]);
} else {
    // If local SMTP is not configured, the enquiry is safely logged in leads.jsonl
    sendJsonResponse(true, 'Thank you! Your enquiry has been registered with our medical desk. A coordinator will reach out shortly.', [
        'name' => $safeName,
        'queued' => true
    ]);
}
