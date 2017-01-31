$(function() {

var snapshot = null;

function updateNote() {
  var note = $('#note').val();
  memoPanelContainer.updateNote(note);
  memoPanelContainer.showMemoPanels();
  setTextareaResizable();
  $('.diff-memo').on('input', function () {
    console.log('hey');
  });
}

function setTextareaResizable() {
  $('textarea').each(function () {
    var attr = 'height:' + (this.scrollHeight) + 'px;overflow-y:hidden;';
    this.setAttribute('style', attr);
  }).on('input', function () {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
  });
}

setTextareaResizable();

// Snapshot button
$('#btn-snapshot').click(function() {
  snapshot = $('#note').val();
  memoPanelContainer.snapshot = snapshot;
  $('#btn-snapshot').prop('disabled', true);
  $('#note').css('background-color', '#EEE');
});

// Update note
$('#note').on('input', function() {
  if (snapshot) {
    updateNote(); 
  }
});

});
