window.onload = function() {
  $('.plantedTime').combodate({
    firstItem: 'none',
    minYear: 2016,
    maxYear: 2016,
    smartDays: true,
  });
  $('.startTime').combodate({firstItem: 'none'});
  $('.endTime').combodate({firstItem: 'none'}); 
};

function newPlant(checked, thing1, thing2) {
  console.log(checked);
  // console.log(i);
  console.log(thing1);
  console.log(thing2);

  if(checked) {
    // thing1.disabled = "";
    console.log(thing1.parentNode.parentNode.childNodes.forEach());
  } else {
    // thing1.disabled = "disabled";
    // thing2.disabled = "disabled";
  }

  // $('.plantedTime');

  // plantSubmit + i + ".hidden = (plantInput" + i + ".checked) ? '' : 'hidden'
}