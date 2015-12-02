window.$ = require('jquery');
window.jQuery = $;

export function tableResize(){
  const w = $('.app-container').width();
  $('.module-table.data-table').css('width', w - (85 * 2));

  const table = $('.module-table.data-table table');
  table.css('width', 'auto');

  if(table.width() < w){
    table.css('width', '100%');
  }
}

export function unbindTableResize(){
  $(window).off( 'resize.table');
}

export function bindTableResize(){
  tableResize();
  $(window).on('resize.table', _.debounce(function(){
    tableResize();
  }, 150));
}