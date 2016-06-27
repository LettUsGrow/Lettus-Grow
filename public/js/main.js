window.onload = function() {
  $('.plantedTime').combodate({
    customClass: 'plantedTime',
    firstItem: 'none',
    minYear: 2015,
    maxYear: 2016,
    smartDays: true,
  });
};

function hideOtherForms(e) {
  // Hide all other forms
  var forms = document.getElementsByTagName('form'),
      buttons = document.getElementsByTagName('button');
  
  for (var i = 0; i < forms.length; i++)
    if(forms[i].className == "plant") forms[i].hidden = 'hidden';
  
  for (var i = 0; i < buttons.length; i++)
    if(buttons[i].className == "add-button") buttons[i].hidden = 'hidden';
  
  // Unhide the form
  e.getElementsByTagName('form')[0].hidden = '';
  e.getElementsByTagName('button')[0].hidden = '';
}