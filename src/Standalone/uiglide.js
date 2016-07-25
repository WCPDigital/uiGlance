/*!
 * uiGlide v1.0.0
 * http://uiglide.com
 *
 * Copyright WCP Digital and Patrick Purcell
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 * Date: 2016-07-25
 */
"use strict";
function uiGlide( args )
{
	var self = this
	
	,version = "1.0.0"
	
	,stepList = []
	,currentStepIndex = 0
	,currentStep = null
	
	,currentSet = []
	,currentSetName = ""
	
	,isAnimating = false
	
	,resizeTimer = null
	
	,focusBoxEl = null
	,focusContentEl = null
	,titleBoxEl = null
	,descBoxEl = null
	
	,prevBtnEl = null
	,nextBtnEl = null
	,closeBtnEl = null
	
	,leftBoxEl = null
	,rightBoxEl = null
	,topBoxEl = null
	,bottomBoxEl = null

	,settings = {
		parent:document.body || null
		,steps:[]
		,defaultSet:"uiGlide"

		,transition:0.5
		,fadeIn:1
		,fadeOut:0.5
		,minWidth:260
		,minHeight:125
		,padding:10
		,borderWidth:2
		,documentPadding:20

		,dataUISet:"data-uigset"
		,dataUIStep:"data-uigstep"
		,dataUITitle:"data-uigtitle"
		,dataUIDesc:"data-uigdesc"
		,dataUIHtml:"data-uightml"
		
		,cssLeftBox:"uig-box uig-box-left"
		,cssRightBox:"uig-box uig-box-right"
		,cssTopBox:"uig-box uig-box-top"
		,cssBottomBox:"uig-box uig-box-bottom"
		,cssFocusBox:"uig-focusbox"
		,cssFocusBoxLeft:"uig-focusbox-left"
		,cssFocusBoxRight:"uig-focusbox-right"
		,cssFocusBoxTop:"uig-focusbox-top"
		,cssFocusBoxBottom:"uig-focusbox-bottom"
		,cssFocusContent:"uig-focus-content"
		,cssTitleBox:"uig-titlebox"
		,cssDescBox:"uig-descbox"
		,cssPrevBtn:"uig-btn uig-btn-prev"
		,cssNextBtn:"uig-btn uig-btn-next"
		,cssCloseBtn:"uig-btn uig-btn-close"
		
		,htmlPrevBtn:"<a href=\"javascript:void(0)\">&lt;</a>"
		,htmlNextBtn:"<a href=\"javascript:void(0)\">&gt;</a>"
		,htmlCloseBtn:"<a href=\"javascript:void(0)\">&#10006;</a>"
		,htmlFocusContent:"<div></div>"
		
		,onBeforeOpen:null
		,onAfterOpen:null
		,onBeforeClose:null
		,onAfterClose:null
		,onBeforeGoto:null
		,onAfterGoto:null
	}

	,createBoxElement = function()
	{
		var boxEl = self.document.createElement("DIV");
		boxEl.style.position = "absolute";
		boxEl.style.display = "block";
		boxEl.style.width = "0px";
		boxEl.style.height = "0px";
		boxEl.style.left = "0px";
		boxEl.style.top = "0px";

		// Return the new object
		return boxEl;
	}

	,nextStep = function()
	{
		gotoStep( (currentStepIndex+1) );
	}
	
	,prevStep = function()
	{
		gotoStep( (currentStepIndex-1) );
	}
	
	,gotoStep = function( stepNum )
	{
		if( settings && settings.onBeforeGoto )
			settings.onBeforeGoto( self );
		
		// If animating, exit
		if( isAnimating )
			return;
		
		// Flag as animating
		isAnimating = true;
	
		// Validate the goto step
		if( isNaN(stepNum) || currentSet[ stepNum ] === undefined ){
			stepNum = 0;
		}
		
		if( currentStep && currentStep.onAfterStep )
			currentStep.onAfterStep( self );
		
		// Update the current step number
		currentStep = currentSet[ stepNum ] || null;
		currentStepIndex = stepNum;
		
		// Ensure we actually have a step
		if( !currentStep || !currentStep.element ){
			throw new Error("uiGlide: Step not found: Set: "+currentSet+", Index: "+currentStepIndex);
		}
	
		if( currentStep && currentStep.onBeforeStep )
			currentStep.onBeforeStep( self );

		// Update the title and desc
		if( currentStep && currentStep.title ){
			titleBoxEl.style.display = "block";
			titleBoxEl.innerHTML = currentStep.title;
		}
		else{
			titleBoxEl.style.display = "none";
		}
		
		if( currentStep && currentStep.desc ){
			descBoxEl.style.display = "block";
			descBoxEl.innerHTML = currentStep.desc;
		}
		else{
			descBoxEl.style.display = "none";
		}

		if( currentStep && currentStep.html ){
			focusContentEl.style.display = "block";
			focusContentEl.innerHTML = currentStep.html;
		}
		else{
			focusContentEl.style.display = "none";
		}
		
		// Toggle Prev/Next Buttons
		if( stepNum <= 0 ){
			prevBtnEl.style.display = "none";
		}
		else{
			prevBtnEl.style.display = "block";
		}
		if( stepNum >= (currentSet.length-1) ){
			nextBtnEl.style.display = "none";
		}
		else{
			nextBtnEl.style.display = "block";
		}
		
		// Capture the current state of the focusBox
		var startWidth = parseInt(focusBoxEl.style.width, 10);
		var startHeight = parseInt(focusBoxEl.style.height, 10);
		var startLeft = parseInt(focusBoxEl.style.left, 10);
		var startTop = parseInt(focusBoxEl.style.top, 10);
		
		removePositionalClasses();
		
		// Begin Animation
		self.animate( function( percent ){

			// Get the target object sdimensions
			var targetRect = self.getElementRect( currentStep.element );

			var endWidth = Math.max(targetRect.width, settings.minWidth) + (settings.padding*2);
			var endHeight = Math.max(targetRect.height, settings.minHeight) + (settings.padding*2);
			var endLeft = targetRect.center.left - (endWidth*0.5);
			var endTop = targetRect.center.top - (endHeight*0.5);

			// Use the doc height to ensure we don't go outside the screen
			var docRect = self.documentOutterRect();
			
			// Test for body overflow, adjust as best as we can.
			var boundsLeft = (docRect.left+self.documentPadding)
				,boundsRight = (docRect.left+docRect.width-self.documentPadding)
				,boundsTop = (docRect.top+self.documentPadding)
				,boundsBottom = (docRect.top+docRect.height-self.documentPadding);
			if( boundsLeft > endLeft ){
				endLeft = boundsLeft;
			}
			else if( boundsRight < (endLeft+endWidth) ){
				endLeft -= ((endLeft+endWidth) - boundsRight);
			}
			if( boundsTop > endTop ){
				endTop = boundsTop;
			}
			else if( boundsBottom < (endTop+endHeight) ){
				endTop -= ((endTop+endHeight) - boundsBottom);
			}

			var w = self.lerp(startWidth,endWidth,percent);
			var h = self.lerp(startHeight,endHeight,percent); 
	 		var x = self.lerp(startLeft,endLeft,percent); 
			var y = self.lerp(startTop,endTop,percent); 

			updateFocusBox(x,y,w,h);

		}, settings.transition, function(){
			isAnimating = false;
			
			addPositionalClasses();
			
			if( currentStep && currentStep.onStep )
				currentStep.onStep( self );

			if( settings && settings.onAfterGoto )
				settings.onAfterGoto( self );
		});
					
		// Scroll page to the step element and focus box
		self.scrollTo(
			settings.parent
			,(currentStep.element.offsetLeft - settings.documentPadding)
			,(currentStep.element.offsetTop - settings.documentPadding)
			,settings.transition
		);
	}
	
	,updateFocusBox = function(x,y,w,h)
	{
		var focusWidth = w;
		var focusHeight = h;
		var focusLeft = x;
		var focusTop = y;
		
		// Use the doc height to ensure we fill the entire screen
		var docRect = self.documentOutterRect();

		focusBoxEl.style.width = Math.abs(focusWidth-(settings.borderWidth*2))+"px";
		focusBoxEl.style.height = Math.abs(focusHeight-(settings.borderWidth*2))+"px";
		focusBoxEl.style.left = focusLeft+"px";
		focusBoxEl.style.top = focusTop+"px";
		focusBoxEl.style.borderWidth = settings.borderWidth+"px";
		
		leftBoxEl.style.width = focusLeft+"px";
		leftBoxEl.style.height = docRect.height+"px";
		leftBoxEl.style.left = "0px";
		leftBoxEl.style.top = "0px";
		leftBoxEl.style.bottom = "auto";

		rightBoxEl.style.width = "auto";
		rightBoxEl.style.height = docRect.height+"px";
		rightBoxEl.style.left = (focusLeft+focusWidth)+"px";
		rightBoxEl.style.right = "0px";
		rightBoxEl.style.top = "0px";
		rightBoxEl.style.bottom = "auto";
		
		topBoxEl.style.width = focusWidth+"px";
		topBoxEl.style.height = focusTop+"px";
		topBoxEl.style.left = focusLeft+"px";
		topBoxEl.style.top = "0px";
		topBoxEl.style.bottom = "auto";
		
		bottomBoxEl.style.width = focusWidth+"px";
		bottomBoxEl.style.height = Math.abs(docRect.height - (focusTop+focusHeight))+"px";
		bottomBoxEl.style.left = focusLeft+"px";
		bottomBoxEl.style.top = (focusTop+focusHeight)+"px";
		bottomBoxEl.style.bottom = "auto";
	}
	
	,addPositionalClasses = function()
	{
			// Get the target object sdimensions
		var focusRect = self.getElementRect( focusBoxEl );
		var docRect = self.documentOutterRect();
		var topDelta = (focusRect.top-docRect.top)
			,bottomDelta = (docRect.top+docRect.height) - (focusRect.top+focusRect.height) 
			,leftDelta = (focusRect.left-docRect.left) 
			,rightDelta = (docRect.left+docRect.width) - (focusRect.left+focusRect.width);
			
			console.log(topDelta+", "+bottomDelta);
		if( topDelta <= bottomDelta){
			self.addClass(focusBoxEl,settings.cssFocusBoxTop);
		}
		else{
			self.addClass(focusBoxEl,settings.cssFocusBoxBottom);
		}
			
			console.log(leftDelta+", "+rightDelta);
		if( leftDelta <= rightDelta){
			self.addClass(focusBoxEl,settings.cssFocusBoxLeft);
		}
		else{
			self.addClass(focusBoxEl,settings.cssFocusBoxRight);
		}		
	}
	
	,removePositionalClasses = function()
	{
		var arr = [
			settings.cssFocusBoxLeft
			,settings.cssFocusBoxRight
			,settings.cssFocusBoxTop
			,settings.cssFocusBoxBottom
		]
		for(var i=0,len=arr.length; i<len; i++){
			self.removeClass(focusBoxEl,arr[i]);
		}
	}
	
	,cleanUp = function()
	{
		// Remove interface events
		self.removeEvent( self.window, "orientationchange", _onWindowResize );
		self.removeEvent( self.window, "resize", _onWindowResize );
		
		self.removeEvent( prevBtnEl, "click", _onPrevClick ); 
		self.removeEvent( prevBtnEl, "touchstart", _onPrevClick ); 
	
		self.removeEvent( nextBtnEl, "click", _onNextClick ); 
		self.removeEvent( nextBtnEl, "touchstart", _onNextClick ); 

		self.removeEvent( closeBtnEl, "click", _onCloseClick ); 
		self.removeEvent( closeBtnEl, "touchstart", _onCloseClick ); 
		
		// Remove close event when not a touch device
		if( !self.isTouchDevice() ){
			var closeEls = [
				leftBoxEl
				,rightBoxEl
				,topBoxEl
				,bottomBoxEl
			];
			for( var i=0,len=closeEls.length; i<len; i++){
				self.removeEvent( closeEls[i], "click", _onCloseClick ); 
				self.removeEvent( closeEls[i], "touchstart", _onCloseClick ); 
			}
		}
	
		// Remove all elements
		var els = [
			closeBtnEl
			,nextBtnEl
			,prevBtnEl
			,descBoxEl
			,titleBoxEl
			,focusBoxEl
			,leftBoxEl
			,rightBoxEl
			,topBoxEl
			,bottomBoxEl
		];
		for(var i=(els.length-1); i>=0; i-- ){
			self.removeElement( els[i] );
			els[i] = null;
		}

		if( settings && settings.onAfterClose )
			settings.onAfterClose( self );
	}

	,close = function()
	{
		if( settings && settings.onBeforeClose )
			settings.onBeforeClose( self );
		
		// Fade-out the elements
		var fadeeEls = [
			focusBoxEl
			,leftBoxEl
			,rightBoxEl
			,topBoxEl
			,bottomBoxEl
		];
		self.animate(function( pcnt ){
			pcnt = (1-pcnt);
			for(var i=(fadeeEls.length-1); i>=0; i-- ){
				self.opacity(fadeeEls[i],pcnt );
			}
		}, settings.fadeOut, cleanUp );

	}
	
	,loadSet = function( setName )
	{
		currentSetName = setName || stepList[0].set || settings.defaultSet;
		currentSet = [];
		for( var i=0,len=stepList.length; i<len; i++ ){
			if( stepList[i].set == currentSetName )
				currentSet.push( stepList[i] );
		}
		
		// Ensure the set contains steps
		if( currentSet.length == 0 ){
			throw new Error("uiGlide: This set is empty or doesn't exist.");
		}

		return sortByIndex( currentSet );
	}
	
	,buildUI = function( )
	{
		// Focus Box and UI
		focusBoxEl = createBoxElement();
		focusBoxEl.className = settings.cssFocusBox;
		settings.parent.appendChild( focusBoxEl )

		focusContentEl = self.document.createElement("DIV");
		focusContentEl.innerHTML = settings.htmlFocusContent;
		focusContentEl.className = settings.cssFocusContent;
		focusBoxEl.appendChild( focusContentEl )
		
		titleBoxEl = self.document.createElement("DIV");
		titleBoxEl.className = settings.cssTitleBox;
		focusBoxEl.appendChild( titleBoxEl )

		descBoxEl = self.document.createElement("DIV");
		descBoxEl.className = settings.cssDescBox;
		focusBoxEl.appendChild( descBoxEl )
		
		prevBtnEl = self.document.createElement("DIV");
		prevBtnEl.className = settings.cssPrevBtn;
		prevBtnEl.innerHTML = settings.htmlPrevBtn;
		focusBoxEl.appendChild( prevBtnEl );
		
		nextBtnEl = self.document.createElement("DIV");
		nextBtnEl.className = settings.cssNextBtn;
		nextBtnEl.innerHTML = settings.htmlNextBtn;
		focusBoxEl.appendChild( nextBtnEl );
		
		closeBtnEl = self.document.createElement("DIV");
		closeBtnEl.className = settings.cssCloseBtn;
		closeBtnEl.innerHTML = settings.htmlCloseBtn;
		focusBoxEl.appendChild( closeBtnEl );
		
		self.addEvent( prevBtnEl, "click", _onPrevClick ); 
		self.addEvent( prevBtnEl, "touchstart", _onPrevClick ); 
		
		self.addEvent( nextBtnEl, "click", _onNextClick ); 
		self.addEvent( nextBtnEl, "touchstart", _onNextClick ); 
		
		self.addEvent( closeBtnEl, "click", _onCloseClick ); 
		self.addEvent( closeBtnEl, "touchstart", _onCloseClick ); 
		
		// Background
		leftBoxEl = createBoxElement();
		leftBoxEl.className = settings.cssLeftBox;
		settings.parent.appendChild( leftBoxEl );

		rightBoxEl = createBoxElement();
		rightBoxEl.className = settings.cssRightBox;
		settings.parent.appendChild( rightBoxEl );

		topBoxEl = createBoxElement();
		topBoxEl.className = settings.cssTopBox;
		settings.parent.appendChild( topBoxEl );

		bottomBoxEl = createBoxElement();
		bottomBoxEl.className = settings.cssBottomBox;
		settings.parent.appendChild( bottomBoxEl )
				
		// Add close event when not a touch device
		if( !self.isTouchDevice() ){
			var closeEls = [
				leftBoxEl
				,rightBoxEl
				,topBoxEl
				,bottomBoxEl
			];
			for( var i=0,len=closeEls.length; i<len; i++){
				self.addEvent( closeEls[i], "click", _onCloseClick ); 
				self.addEvent( closeEls[i], "touchstart", _onCloseClick ); 
			}
		}
		
		// Window events
		self.addEvent( self.window, "orientationchange", _onWindowResize );
		self.addEvent( self.window, "resize", _onWindowResize );
		
		// Starting position
		var docRect = self.documentOutterRect();
		var w = 200
			,h = 200
			,x = ((docRect.width*0.5)-w)
			,y = 100;
		updateFocusBox(x,y,w,h);
	}
	
	,open = function( setName, stepNum )
	{
		if( settings && settings.onBeforeOpen )
			settings.onBeforeOpen( self );
		
		buildUI();
		
		// Fade-in the element
		self.animate(function( pcnt ){
			self.opacity(focusBoxEl,pcnt);
		}, settings.fadeIn);
		
		var els = [
			leftBoxEl
			,rightBoxEl
			,topBoxEl
			,bottomBoxEl
		];
			
		// Fade-in the element
		self.animate(function( pcnt ){
			for(var i=(els.length-1); i>=0; i-- ){
				self.opacity(els[i],pcnt);
			}
		}, (settings.fadeIn*1.5) );

		if( settings && settings.onAfterOpen )
			settings.onAfterOpen( self );
		
		// Cache the Set
		loadSet( setName );
		
		// Goto the step in the set
		gotoStep( stepNum );
	}
	
	,getIncontextSteps = function()
	{
		var steps = [];
		
		// Travers the DOM and find all UI Steps
		var stepEls = self.getElementByAttrValue( settings.dataUIStep, null, settings.parent);
		for(var i = 0, len = stepEls.length, index = 0, set = null, title = "", desc = "", html = ""; i<len; i++){
		
			index = parseInt( self.getAttr( stepEls[i], settings.dataUIStep ), 10);
			set = self.getAttr( stepEls[i], settings.dataUISet ) || settings.defaultSet;
			title = self.getAttr( stepEls[i], settings.dataUITitle );
			desc = self.getAttr( stepEls[i], settings.dataUIDesc );
			html = self.getAttr( stepEls[i], settings.dataUIHtml );

			steps.push( {
				index:index
				,element:stepEls[i]
				,set:set
				,title:title
				,desc:desc
				,html:html
				,onBeforeStep:null
				,onAfterStep:null
				,onStep:null
				,uiGlide:self
			} );
		}
		
		return steps;
	}
		
	,processSettingsSteps = function( arr )
	{
		for(var i=0,len=arr.length; i<len; i++){
			arr.index = i;
			if( !arr.set ){
				arr.set = settings.defaultSet
			}
		}
		return arr;
	}
	
	,sortBySet = function( arr )
	{
		arr.sort(function(a, b){
			return a.set == b.set ? 0 : +(a.set > b.set) || -1;
		});
		return arr;
	}
	
	,sortByIndex = function( arr )
	{
		arr.sort(function(a, b){
			return a.index == b.index ? 0 : +(a.index > b.index) || -1;
		});
		return arr;
	}

	,mergeStepsLists = function( a, b )
	{
		for( var i=0, len=a.length; i<len; i++ ){
			if( b[i] ){
				if( a[i] ){
					a[i] = self.wash( a[i], b[i] );
				} 
				else {
					a[i] = b[i];
				}
			}
		}
		
		for( var i=0, len=b.length; i<len; i++ ){
			if( !a[i] && b[i] ){
				a[i] = b[i];
			}
		}
		
		return self.arrayClean( a );
	}

	/**
	* Events
	*/
	,_onPrevClick = function( e )
	{
		var ev = self.normaliseEvent( e )
		ev.preventDefault();
		prevStep();
	}
	
	,_onNextClick = function( e )
	{
		var ev = self.normaliseEvent( e );
		ev.preventDefault();
		nextStep();
	}
	
	,_onCloseClick = function( e )
	{
		var ev = self.normaliseEvent( e );
		ev.preventDefault();
		close();
	}

	,_onWindowResize = function( e )
	{
		clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function(){
			gotoStep( currentStepIndex );
		}, 250);
	}
	
	/**
	* Constructor
	*/
	,init = function()
	{
		if( args ){
			settings = self.wash( settings, args );
			self.window = args.window || window;
			self.document = args.document || document;
		}
		
		// Ensure we have a parent DOMElement to attach our dynamic elements to
		if( !( settings.parent && settings.parent.appendChild ) ){
			throw new Error("uiGlide: Cannot append elements to the settings.parent element.");
		}

		// Travers the DOM and find all UI Steps
		var incontextSteps = getIncontextSteps();
		
		// Set the index and default set for the setting steps
		var settingsSteps = processSettingsSteps( settings.steps );
		
		// Merge the incontext steps with setting steps
		// Verify the sequence / Clean the array
		stepList = mergeStepsLists( incontextSteps, settingsSteps );
		
		// Order steps by set
		stepList = sortBySet( stepList );
	};
	
	/**
	* Public Methods
	*/
	self.open = open;
	self.close = close;
	self.next = nextStep;
	self.prev = prevStep;
	self.goto = gotoStep;
	
	/**
	* Public Accessor Methods
	*/	
	self.getFocusBox = function(){
		return focusBoxEl;
	};
	
	self.getSettings = function(){
		return settings;
	};
	
	self.getSteps = function(){
		return currentSet;
	};
	
	self.getStep = function( idx ){
		return currentSet[idx] || null;
	};
	
	self.getCurrentSet = function(){
		return currentSet;
	};
	self.getCurrentSetName = function(){
		return currentSetName;
	};
	
	self.getCurrentStep = function(){
		return currentStep;
	};
	self.getCurrentStepIndex = function(){
		return currentStepIndex;
	};
	
	self.getVersion = function(){
		return version;
	};

	/**
	* Public properties
	* This is for the prototype
	*/
	self.window = window;
	self.document = document;
	
	// Constructor
	init();
};
uiGlide.prototype.constructor = uiGlide;

/**
* Interface methods
* These could be replaced by a 3rd Party library. eg. jQuery
*/
uiGlide.prototype.lerp = function( a, b, pcnt )
{
	return a + pcnt * (b - a);
}
uiGlide.prototype.isTouchDevice = function() 
{
	return "ontouchstart" in window || navigator.maxTouchPoints;
}
uiGlide.prototype.arrayClean = function( arr )
{
	var nArr = [];
	for(var i = 0, len = arr.length; i<len; i++ ){
		arr[i] && nArr.push(arr[i]);
	}
	return nArr;
}
uiGlide.prototype.wash = function( a, b )
{
	for( var name in b ){
		if( !b.hasOwnProperty(name) ) 
			continue;
		
		if( a.hasOwnProperty(name) ){
			a[name] = b[name];
		}
	}
	return a;
}
uiGlide.prototype.scrollOffset = function( el ) 
{
	var left = 0, top = 0;
	
	// Get the elements scroll position
	// Ignoring if it's the document or body
	if( el && el !== this.document.body && el !== this.document.documentElement ){
		left = el.scrollLeft; 
		top = el.scrollTop;
	}
	
	// Get document scroll position
	else{
		left = (this.window.scrollX  || this.window.pageXOffset || this.document.documentElement.scrollLeft); 
		top = (this.window.scrollY  || this.window.pageYOffset || this.document.documentElement.scrollTop);
	}
	
	return{
		left:left,
		top:top
	}
}
uiGlide.prototype.getScrollingElement = function() 
{
  var d = this.document;

  return  d.documentElement.scrollHeight > d.body.scrollHeight &&
		  d.compatMode.indexOf("CSS1") == 0 ?
		  d.documentElement :
		  d.body;
}
uiGlide.prototype.documentOutterRect = function() 
{
	var body = this.document.body, 
		html = this.document.documentElement;

	var width = Math.max( body.scrollWidth, body.offsetWidth, 
					   html.clientWidth, html.scrollWidth, html.offsetWidth );

	var height = Math.max( body.scrollHeight, body.offsetHeight, 
					   html.clientHeight, html.scrollHeight, html.offsetHeight );

	return{
		width:width
		,height:height
		,left:0
		,top:0
	}
}
uiGlide.prototype.getElementRect = function( el ) 
{
	var bounds = el.getBoundingClientRect(),
		left = bounds.left + (this.window.scrollX  || this.window.pageXOffset || this.document.documentElement.scrollLeft),
		top = bounds.top + (this.window.scrollY  || this.window.pageYOffset || this.document.documentElement.scrollTop),
		width = (bounds.right - bounds.left),
		height = (bounds.bottom - bounds.top),
		centerLeft = (left + (width*0.5)),
		centerTop = (top + (height*0.5));
	
	return { 
		left:left, 
		top:top,
		width:width,
		height:height,
		center:{
			left:centerLeft,
			top:centerTop
		}
	};
}
uiGlide.prototype.removeElement = function( el )
{
	if( el && el.parentElement )
		el.parentElement.removeChild( el );

	return el = null;
}
uiGlide.prototype.hasClass = function( el, className ) 
{
	return el && !!el.className.match( new RegExp("(\\s|^)"+className+"(\\s|$)") );
}
uiGlide.prototype.addClass = function( el, className ) 
{
	if( !this.hasClass( el, className ) ) 
		el.className += " " + className;
	return;
}
uiGlide.prototype.removeClass = function( el, className )
{
	if( this.hasClass(el,className) ){
		var reg = new RegExp("(\\s|^)" + className + "(\\s|$)");
		var str = 
		el.className = el.className.replace( reg, " " ).trim();
	}
	return;
}
uiGlide.prototype.getElementByAttrValue = function( attr, val, parentEl, firstOnly )
{
	parentEl = parentEl || this.document;
	
	var selector = (val != null) ? "["+attr+"='"+val+"']" : "["+attr+"]";
	var result = (parentEl.querySelectorAll && parentEl.querySelectorAll(selector)) || null;
	
	if( !result ){
		var  el = null, i=0, result = [], descendants = parentEl.getElementsByTagName("*");
		while( el = descendants[i++] ) {
			var attrval = this.getAttr( el, attr );
			
			if( val == null && attrval ){
				result.push(el);
			}
			
			else if( val != null && attrval == val ){ 
				result.push(el);
			}
		}
	}
	return !firstOnly ? result : result[0]||null;
}
uiGlide.prototype.getAttr = function( el, attr ) 
{
	var result = (el.getAttribute && el.getAttribute(attr)) || null;
	if( !result ) {
		var attrs = el.attributes || [];
		var length = attrs.length
		for( var i = 0; i < length; i++ ){
			if( attrs[i].nodeName === attr ){
				result = attrs[i].nodeValue;
			}
		}
	}
	return result;
}
uiGlide.prototype.addEvent = function( el, ev, callback ) 
{
	// For all major browsers, except IE 8 and earlier
	if( el.addEventListener )
		el.addEventListener(ev, callback, false );

	// For IE 8 and earlier versions
	else if( el.attachEvent ){
		el.attachEvent("on"+ev, callback );
	}

	return el;
}
uiGlide.prototype.removeEvent = function( el, ev, callback ) 
{
	// For all major browsers, except IE 8 and earlier
	if( el.removeEventListener )
		el.removeEventListener(ev, callback, false );

	// For IE 8 and earlier versions
	else if( el.detachEvent )
		el.detachEvent("on"+ev, callback );

	return el;
}
uiGlide.prototype.normaliseEvent = function( e ) 
{
	// Fallback for IE
	e = e || this.window.event;
	if( e ){

		// Event type
		var type = e.type;

		// Get the event Element
		var el = e.currentTarget || e.srcElement;

		// Prevent Default response
		var preventDefault = function(){
			e.preventDefault ? e.preventDefault() : e.returnValue = false;
		}
			
		// Prevent Event Bubbling
		var stopPropagation = function(){
			e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;
		}

		// Get Touches
		var touches = e.touches;// || e.changedTouches;
	
		// Normalise Key Press
		var key = e.which || {};
		if( e.which == null && (e.charCode != null || e.keyCode != null) ){
			key = e.charCode != null ? e.charCode : e.keyCode;
		}
	
		// Normalise Mouse Click
		// LeftButton = 1,
		// MiddleButton = 2,
		// RightButton = 3,
		var which = e.which || {};
		if( e.which == null && e.button !== undefined ) {
			which = (e.button & 1 ? 1 : ( e.button & 2 ? 3 : ( e.button & 4 ? 2 : 0 ) ) );
		}
	
		// Translate touches to mouse clicks (Always Left)
		if( touches != null ){
			which = touches.length > 1 ? 3 : 1;
		}

		// Capture the scroll offsets
		var scrollOffsetLeft = (this.window.scrollX || this.window.pageXOffset || this.document.documentElement.scrollLeft);
		var scrollOffsetTop = (this.window.scrollY || this.window.pageYOffset || this.document.documentElement.scrollTop);

		// Event Position
		// Touch Screen
		var x = 0,y = 0;
		if( e.changedTouches ){
			x = e.changedTouches[0].clientX || 0;
			y = e.changedTouches[0].clientY || 0;
		}
	
		// Mouse
		else{
			x = (e.clientX || e.pageX || 0);
			y = (e.clientY || e.pageY || 0);
		}
	
		// Offset by Scroll position 
		x += scrollOffsetLeft;
		y += scrollOffsetTop;

		return {
			event:e,
			element:el,
			type:type,
			key:key,
			which:which,
			touches:touches,
			top:y,
			left:x,
			preventDefault:preventDefault,
			stopPropagation:stopPropagation
		};
	}
	return null;
}
uiGlide.prototype.scrollTo = function( el, endLeft, endTop, speed )
{	
	var self = this;
	
	speed = speed || 0;

	if( !el || el == this.document.body || el == this.document.documentElement ){
		el = self.getScrollingElement();
	}
	
	var scrollStart = self.scrollOffset( el );
	var deltaLeft = (endLeft||0) - scrollStart.left;
	var deltaTop = (endTop||0) - scrollStart.top;
	
	this.animate(function( pcnt ){
		el.scrollLeft = scrollStart.left + (deltaLeft*pcnt);
		el.scrollTop = scrollStart.top + (deltaTop*pcnt);
	}, speed );
}
uiGlide.prototype.animate = function( callback, duration, onComplete )
{	
	var fps = 60, delta = 0, lastCalledTime = Date.now();
	var resolution = (1000/fps), endtime = (duration*1000), percent = 0, counter = 0, interval = setInterval( function(){
		
		percent = (counter/endtime);
		if( percent >= 1){
			callback( 1 );
			clearInterval( interval );
			return onComplete && onComplete();
		}
		callback( percent );
		
		delta = Math.floor(1/((Date.now() - lastCalledTime)*0.001));
		lastCalledTime = Date.now();
		counter += (resolution*(fps/delta));
		
	}, resolution );
}
uiGlide.prototype.opacity = function( el, opacity )
{
	// Normal Browsers
	el.style.opacity = opacity;

	// IE
	var pct = opacity*100;
	el.style.filter = "alpha(opacity="+pct+")";
}
