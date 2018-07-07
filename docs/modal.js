//
// modal is a global object with two methods: 
// 
// - void    show(HTMLElement)    // <<< shows the given HTML Element in a modal dialog.
// - boolean isRunning()          // <<< true if we are running the modal dialog.
//
var modal = (function() {
  var isShowing = false;	
  return {
	show : function(element) {
	  if (isShowing) throw 'invalid state'; // programming error. (attempt to show a modal dialog while one is already showing) 
	  var bodyOverflow = document.body.style.overflow; 
	  var divBlanket = document.createElement('div');
	  divBlanket.style.position = 'fixed';
	  divBlanket.style.top =    '0';
	  divBlanket.style.bottom = '0';
	  divBlanket.style.left =   '0';
	  divBlanket.style.right =  '0';
	  divBlanket.style.opacity = '0.5';
	  divBlanket.style.backgroundColor='#005'
			
	  var divX = document.createElement('div');
	  divX.style.position = 'fixed';
	  divX.style.top =   '10%';
	  divX.style.right = '10%';
	  divX.style.margin = '-16px -16px 0 0';
      divX.style.width =  '16px';
      divX.style.height =  '16px';
	  divX.style.lineHeight = '16px'; 
	  divX.style.backgroundColor = '#333';
	  divX.style.borderRadius = '50%';
	  divX.style.fontSize = '11px'; 
	  divX.style.color = '#fff';
	  divX.style.textAlign = 'center'; 
	  divX.style.cursor = 'pointer';
	  divX.innerHTML = '&times;'
			
	  var divModal = document.createElement('div'); 
	  divModal.style.position = 'fixed';
	  divModal.style.top =    '10%';
	  divModal.style.left =   '10%';
	  divModal.style.right =  '10%';
	  divModal.style.bottom = '10%';
	  divModal.style.outline = '1px solid #999';
	  divModal.style.backgroundColor = '#f5f7fb'; // same as body.background
			
	  divModal.appendChild(element);
		
	  divX.onclick = function() {
		document.body.removeChild(divBlanket);
		document.body.removeChild(divX); 
		document.body.removeChild(divModal);
		document.body.style.overflow = bodyOverflow;
		isShowing = false; 
	  }
			
	  document.body.appendChild(divBlanket);
	  document.body.appendChild(divX); 
	  document.body.appendChild(divModal); 
	  document.body.style.overflow = 'hidden';
	  isShowing = true; 
	}, 
	isShowing: function() {
	  return isShowing;	
	}
  }	
})();