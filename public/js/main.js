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