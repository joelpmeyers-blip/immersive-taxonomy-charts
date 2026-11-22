// ═══════════════════════════════════════════════════════════════════════════════
// MEMO: doPost additions for workshop_exp_questionnaire
// These two action handlers slot into the existing doPost BEFORE the
// verifyGoogleToken check (the questionnaire is a public-facing form with no
// Google auth).  Add the action dispatch block marked ── NEW ── below.
// ═══════════════════════════════════════════════════════════════════════════════
//
// In the existing doPost, add this block immediately after `log('Action: ...')`
// and BEFORE the verifyGoogleToken call:
//
//   if (data.action === 'submitSliderResponse') {
//     return handleSliderResponse(data);
//   }
//   if (data.action === 'submitQuestionnaireResponse') {
//     return handleQuestionnaireResponse(data);
//   }
//
// ───────────────────────────────────────────────────────────────────────────────


// ── Slider response ────────────────────────────────────────────────────────────
// Fixed columns matching the Phase 2 categorization UI.
// Payload keys sent by the HTML: Name, Role, Experience, Submission Date,
//   Responsivity, Agency, Curation, Intensity, Reality,
//   Modality, Locale, Synchronicity  (Mutability suppressed)
function handleSliderResponse(data) {
  var params = Toolkit.getSheetParameters(sliderRespSheet, 'Name');

  var COLS = [
    'Name', 'Role', 'Experience', 'Submission Date',
    'Responsivity', 'Agency', 'Curation', 'Intensity', 'Reality',
    'Modality', 'Locale', 'Synchronicity',
  ];

  var counter  = 0;
  var printRow = [];
  var matchKey = [];

  COLS.forEach(function(col) {
    var val = data[col];
    if (val !== undefined && val !== null && val !== '') {
      // Coerce numeric strings to numbers for the dimension values
      val = (isNaN(val) || val === '') ? val : Number(val);
      printRow.push(val);
      matchKey.push([counter, col]);
      counter++;
    }
  });

  Toolkit.printArrayToCols([printRow], matchKey, sliderRespSheet, params);

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}


// ── Questionnaire response ─────────────────────────────────────────────────────
// Dynamic columns — grows automatically as new question keys appear.
// Payload keys sent by the HTML: Name, Role, Experience, Submission Date,
//   answers: [["1", value], ["1-explain", text], ...]
// Gated questions that were never shown are absent from answers.
// Optional-text entries are keyed as "<number>-explain".
function handleQuestionnaireResponse(data) {
  var params = Toolkit.getSheetParameters(quesRespSheet, 'Name');

  var META = ['Name', 'Role', 'Experience', 'Submission Date'];

  // Build a flat key→value map: metadata first, then each answer pair
  var info = {};
  META.forEach(function(k) { info[k] = data[k] || ''; });
  (data.answers || []).forEach(function(pair) { info[pair[0]] = pair[1]; });

  var counter  = 0;
  var printRow = [];
  var matchKey = [];

  Object.keys(info).forEach(function(key) {
    var val = info[key];
    if (val !== undefined && val !== null && val !== '') {
      printRow.push(val);
      matchKey.push([counter, key]);
      counter++;
    }
  });

  Toolkit.printArrayToCols([printRow], matchKey, quesRespSheet, params);

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}
