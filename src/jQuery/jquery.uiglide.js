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
(function( $ ){
	
    function uiGlide( args )
	{
		var self = this
		
		,version = "1.0.0"
		
		,stepList = []
		,currentStepIndex = 0
		,currentStep = null
		
		,currentSet = []
		,currentSetName = ""

		,isOpening = false
		,isClosing = false
	
		,animation = null
		
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

			,fadeIn:1000
			,fadeOut:500
			,documentPadding:20
			
			,transition:500
			,padding:10
			,borderWidth:2
			,minWidth:220
			,minHeight:125
			,maxWidth:800
			,maxHeight:600
			,passthrough:true

			,dataUISet:"data-uigset"
			,dataUIStep:"data-uigstep"
			,dataUITitle:"data-uigtitle"
			,dataUIDesc:"data-uigdesc"
			,dataUIHtml:"data-uightml"
			,dataUIPassthrough:"data-uigpassthrough"
			
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
			,onBeforeStep:null
			,onAfterStep:null
			,onStep:null
		}
			
		,isTouchDevice = function() 
		{
			return "ontouchstart" in window || navigator.maxTouchPoints;
		}

		,lerp = function( a, b, pcnt )
		{
			return a + pcnt * (b - a);
		}

		,opacity = function( el, opacity )
		{
			// Normal Browsers
			el.style.opacity = opacity;

			// IE
			var pct = opacity*100;
			el.style.filter = "alpha(opacity="+pct+")";
		}

		,animate = function( callback, duration, onComplete )
		{	
			var fps = 60, delta = 0, lastCalledTime = Date.now();
			var resolution = (1000/fps), endtime = duration, percent = 0, counter = 0, interval = setInterval( function(){
				
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
			
			return interval;
		}

		,scrollOffset = function( el ) 
		{
			var d = self.document
				,w = self.window
				,left = 0
				,top = 0;
			
			// Get the elements scroll position
			// Ignoring if it's the document or body
			if( el !== d.body && el !== d.documentElement ){
				left = el.scrollLeft; 
				top = el.scrollTop;
			}
			
			// Get document scroll position
			else{
				left = (w.scrollX  || w.pageXOffset || d.documentElement.scrollLeft); 
				top = (w.scrollY  || w.pageYOffset || d.documentElement.scrollTop);
			}
			
			return{
				left:left,
				top:top
			}
		}

		,documentOutterRect = function() 
		{
			var body = self.document.body, 
				html = self.document.documentElement;

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
		
		,getElementRect = function( el ) 
		{
			var d = self.document
				,w = self.window
				,bounds = el.getBoundingClientRect()
				,left = bounds.left + (w.scrollX  || w.pageXOffset || d.documentElement.scrollLeft)
				,top = bounds.top + (w.scrollY  || w.pageYOffset || d.documentElement.scrollTop)
				,width = (bounds.right - bounds.left)
				,height = (bounds.bottom - bounds.top)
				,centerLeft = (left + (width*0.5))
				,centerTop = (top + (height*0.5));
			
			return { 
				left:left
				,top:top
				,width:width
				,height:height
				,center:{
					left:centerLeft
					,top:centerTop
				}
			};
		}
			
		,getElementOffsetRect = function(el,parent)
		{
			var d = self.document
				,w = self.window;
				
			// If we're checking against the body
			// then we can use the normal method
			if( parent == d.body || parent == d.documentElement ){
				return getElementRect(el);
			}
			
			var scroll = scrollOffset(parent)
				,parentBounds = parent.getBoundingClientRect()
				,bounds = el.getBoundingClientRect()
				,left = (bounds.left-parentBounds.left+scroll.left)
				,top = (bounds.top-parentBounds.top+scroll.top)
				,width = (bounds.right - bounds.left)
				,height = (bounds.bottom - bounds.top)
				,centerLeft = (left + (width*0.5))
				,centerTop = (top + (height*0.5));
			
			return { 
				left:left
				,top:top
				,width:width
				,height:height
				,center:{
					left:centerLeft
					,top:centerTop
				}
			};
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
			goto( (currentStepIndex+1) );
		}
		
		,prevStep = function()
		{
			goto( (currentStepIndex-1) );
		}
			
		,goto = function( stepNum )
		{
			var d = self.document
				,w = self.window;
			
			if( settings && settings.onBeforeGoto )
				settings.onBeforeGoto( self );
			
			// If animating, stop
			if( animation ){
				stop();
			}
		
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
			
			// Toggle passthrough pointer events
			if( currentStep.passthrough ){
				focusBoxEl.style.pointerEvents = "none";
				
				prevBtnEl.style.pointerEvents = "auto";
				nextBtnEl.style.pointerEvents = "auto";
				closeBtnEl.style.pointerEvents = "auto";
			}
			
			else{
				focusBoxEl.style.pointerEvents = "auto";
			}
			
			// Add the border
			focusBoxEl.style.borderWidth = currentStep.borderWidth+"px";
			
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
			var focusStart = getElementOffsetRect( focusBoxEl, settings.parent );
			
			var startWidth = parseInt(focusBoxEl.style.width, 10);
			var startHeight = parseInt(focusBoxEl.style.height, 10);
			var startLeft = parseInt(focusBoxEl.style.left, 10);
			var startTop = parseInt(focusBoxEl.style.top, 10);
			
			// Capture teh Scroll starting position
			var scrollStart = scrollOffset( settings.parent );
			
			removePositionalClasses();
			
			// Begin Animation
			animation = animate( function( pcnt ){
				
				var scrollEndLeft = (currentStep.element.offsetLeft - settings.documentPadding);
				var scrollEndTop = (currentStep.element.offsetTop - settings.documentPadding);

				var scrollLeft = lerp(scrollStart.left,scrollEndLeft,pcnt); 
				var scrollTop = lerp(scrollStart.top,scrollEndTop,pcnt); 
				
				if( !settings.parent || settings.parent == d.body || settings.parent == d.documentElement ){
					d.documentElement.scrollLeft = d.body.scrollLeft = (scrollLeft-settings.documentPadding);
					d.documentElement.scrollTop = d.body.scrollTop = (scrollTop-settings.documentPadding);
				}
				
				else{
					settings.parent.scrollLeft = scrollLeft;
					settings.parent.scrollTop = scrollTop;
				}

				// Get the target object sdimensions
				var targetRect = getElementOffsetRect( currentStep.element, settings.parent );

				var padding = (currentStep.padding*2);
				var border = (currentStep.borderWidth*2)
				var endWidth = Math.max( (targetRect.width + padding - border), currentStep.minWidth);
				var endHeight = Math.max( (targetRect.height + padding - border), currentStep.minHeight);
				endWidth = Math.min( (endWidth + padding - border), currentStep.maxWidth);
				endHeight = Math.min( (endHeight + padding - border), currentStep.maxHeight);
				
				var endLeft = targetRect.center.left - (endWidth*0.5);
				var endTop = targetRect.center.top - (endHeight*0.5);

				// Use the doc height to ensure we don't go outside the screen
				var docRect = documentOutterRect();
				
				// Test for body overflow, adjust as best as we can.
				var boundsLeft = (docRect.left+settings.documentPadding)
					,boundsRight = (docRect.left+docRect.width-settings.documentPadding)
					,boundsTop = (docRect.top+settings.documentPadding)
					,boundsBottom = (docRect.top+docRect.height-settings.documentPadding);
					
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

				var w = lerp(focusStart.width,endWidth,pcnt);
				var h = lerp(focusStart.height,endHeight,pcnt); 
				var x = lerp(focusStart.left,endLeft,pcnt); 
				var y = lerp(focusStart.top,endTop,pcnt); 

				updateFocusBox(x,y,w,h);

			}, currentStep.transition, function(){
				stop();
				
				addPositionalClasses();
				
				if( currentStep && currentStep.onStep )
					currentStep.onStep( self );

				if( settings && settings.onAfterGoto )
					settings.onAfterGoto( self );
			});
			
			// Enable Chaining
			return self;
		}
	
		,stop = function()
		{
			clearInterval(animation);
			animation = null;
			
			// Enable Chaining
			return self;
		}
		
		,updateRect = function( el, width, height, left, top, right, bottom )
		{
			el.style.width = width;
			el.style.height = height;
			el.style.left = left;
			el.style.top = top;
			el.style.right = right;
			el.style.bottom = bottom;
		}
		
		,updateFocusBox = function(x,y,w,h)
		{
			var focusWidth = w;
			var focusHeight = h;
			var focusLeft = x;
			var focusTop = y;
			
			// Use the doc height to ensure we fill the entire screen
			var docRect = documentOutterRect();

			updateRect(
				focusBoxEl
				,Math.max(focusWidth,0)+"px"
				,Math.max(focusHeight,0)+"px"
				,focusLeft+"px"
				,focusTop+"px"
				,"auto"
				,"auto" 
			);
			
			updateRect(
				leftBoxEl
				,Math.max(focusLeft,0)+"px"
				,Math.max(docRect.height,0)+"px"
				,"0px"
				,"0px"
				,"auto"
				,"auto" 
			);
			
			updateRect(
				rightBoxEl
				,"auto"
				,Math.max(docRect.height,0)+"px"
				,(focusLeft+focusWidth)+"px"
				,"0px"
				,"0px"
				,"auto" 
			);
			
			updateRect(
				topBoxEl
				,Math.max(focusWidth,0)+"px"
				,Math.max(focusTop,0)+"px"
				,focusLeft+"px"
				,"0px"
				,"auto"
				,"auto" 
			);

			updateRect(
				bottomBoxEl
				,Math.max(focusWidth,0)+"px"
				,Math.max( (docRect.height - (focusTop+focusHeight)),0)+"px"
				,focusLeft+"px"
				,(focusTop+focusHeight)+"px"
				,"auto"
				,"auto" 
			);

		}
		
		
		,addPositionalClasses = function()
		{
			// Get the target object sdimensions
			var focusRect = getElementOffsetRect( focusBoxEl,settings.parent );
			var docRect = documentOutterRect();
			var topDelta = (focusRect.top-docRect.top)
				,bottomDelta = (docRect.top+docRect.height) - (focusRect.top+focusRect.height) 
				,leftDelta = (focusRect.left-docRect.left) 
				,rightDelta = (docRect.left+docRect.width) - (focusRect.left+focusRect.width);

			if( topDelta <= bottomDelta){
				$(focusBoxEl).addClass(settings.cssFocusBoxTop);
			}
			else{
				$(focusBoxEl).addClass(settings.cssFocusBoxBottom);
			}

			if( leftDelta <= rightDelta){
				$(focusBoxEl).addClass(settings.cssFocusBoxLeft);
			}
			else{
				$(focusBoxEl).addClass(settings.cssFocusBoxRight);
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
				$(focusBoxEl).removeClass(arr[i]);
			}
		}
		
		,cleanUp = function()
		{
			// Remove interface events
			$(self.window).off( "orientationchange", _onWindowResize );
			$(self.window).off( "resize", _onWindowResize );
			$(settings.parent).off( "orientationchange", _onWindowResize );
			$(settings.parent).off( "resize", _onWindowResize );
			
			$(prevBtnEl).off("click", _onPrevClick);
			$(prevBtnEl).off("touchstart", _onPrevClick);

			$(nextBtnEl).off("click", _onNextClick);
			$(nextBtnEl).off("touchstart", _onNextClick);
			
			$(closeBtnEl).off("click", _onCloseClick);
			$(closeBtnEl).off("touchstart", _onCloseClick); 
			
			// Remove close event when not a touch device
			if( !isTouchDevice() ){
				var closeEls = [
					leftBoxEl
					,rightBoxEl
					,topBoxEl
					,bottomBoxEl
				];
				for( var i=0,len=closeEls.length; i<len; i++){
					$(closeEls[i]).off( "click", _onCloseClick );
					$(closeEls[i]).off( "touchstart", _onCloseClick );
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
				$( els[i] ).remove();
				els[i] = null;
			}

			if( settings && settings.onAfterClose )
				settings.onAfterClose( self );

			// Complete Closing
			isClosing = false;
		}

		,close = function()
		{
			if( isOpening ){
				throw new Error("uiGlide: Tried to close before completing the opening.");
			}
			
			// Begin Closing
			isClosing = true;
			
			if( settings && settings.onBeforeClose )
				settings.onBeforeClose( self );
			
			// If animating, stop
			if( animation ){
				stop();
			}
			
			// Fade-out the elements
			var fadeEls = [
				focusBoxEl
				,leftBoxEl
				,rightBoxEl
				,topBoxEl
				,bottomBoxEl
			];

			animate(function( pcnt ){
				pcnt = (1-pcnt);
				for(var i=(fadeEls.length-1); i>=0; i-- ){
					opacity(fadeEls[i],pcnt );
				}
			}, settings.fadeOut, cleanUp );

			// Enable Chaining
			return self;
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
			
			$(prevBtnEl).on("click", _onPrevClick);
			$(prevBtnEl).on("touchstart", _onPrevClick);

			$(nextBtnEl).on("click", _onNextClick);
			$(nextBtnEl).on("touchstart", _onNextClick);
			
			$(closeBtnEl).on("click", _onCloseClick);
			$(closeBtnEl).on("touchstart", _onCloseClick);
			
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
			if( !isTouchDevice() ){
				var closeEls = [
					leftBoxEl
					,rightBoxEl
					,topBoxEl
					,bottomBoxEl
				];
				
				for( var i=0,len=closeEls.length; i<len; i++){
					$(closeEls[i]).on( "click", _onCloseClick );
					$(closeEls[i]).on( "touchstart", _onCloseClick ); 
				}
			}
			
			// Resize events
			$(settings.parent).on( "orientationchange", _onWindowResize );
			$(settings.parent).on( "resize", _onWindowResize );
			$(self.window).on( "orientationchange", _onWindowResize );
			$(self.window).on( "resize", _onWindowResize );
			
			// Starting position
			var docRect = documentOutterRect();
			var w = 200
				,h = 200
				,x = ((docRect.width*0.5)-w)
				,y = 100;
			updateFocusBox(x,y,w,h);
		}
		
		,open = function( stepNum, setName )
		{
			if( isClosing ){
				throw new Error("uiGlide: Tried to open before completing the close.");
			}
			
			if( focusBoxEl ){
				throw new Error("uiGlide: You can only open one glide at a time.");
			}
			
			// Begin Opening
			isOpening = true;
			
			if( settings && settings.onBeforeOpen )
				settings.onBeforeOpen( self );
			
			buildUI();
			
			// Fade-in the elements
			animate(function( pcnt ){
				opacity(focusBoxEl,pcnt);
			}, settings.fadeIn);
				
			var els = [
				leftBoxEl
				,rightBoxEl
				,topBoxEl
				,bottomBoxEl
			];
			animate(function( pcnt ){
				for(var i=(els.length-1); i>=0; i-- ){
					opacity(els[i],pcnt);
				}
			}, (settings.fadeIn*1.5) );

			if( settings && settings.onAfterOpen )
				settings.onAfterOpen( self );
			
			// Cache the Set
			loadSet( setName );
			
			// Opeing complete
			isOpening = false;
			
			// Goto the step in the set
			// Enable Chaining
			return goto( stepNum );
		}
		
		,getIncontextSteps = function()
		{
			var steps = [];
			
			// Travers the DOM and find all UI Steps
			var stepEls = $( "["+settings.dataUIStep+"]", settings.parent );
			for(var i = 0, len = stepEls.length, index = 0, set = null, title = "", desc = "", html = "", passthrough = null; i<len; i++){
			
				index = parseInt( $(stepEls[i]).attr(settings.dataUIStep), 10);
				set = $(stepEls[i]).attr( settings.dataUISet );
				title = $(stepEls[i]).attr( settings.dataUITitle );
				desc = $(stepEls[i]).attr( settings.dataUIDesc );
				html = $(stepEls[i]).attr( settings.dataUIHtml );
				passthrough = $(stepEls[i]).attr( settings.dataUIPassthrough );

				steps.push( {
					index:index
					,element:stepEls[i]
					,set:set || settings.defaultSet
					,title:title
					,desc:desc
					,html:html
					,transition:settings.transition
					,minWidth:settings.minWidth
					,minHeight:settings.minHeight
					,maxWidth:settings.maxWidth
					,maxHeight:settings.maxHeight
					,borderWidth:settings.borderWidth
					,padding:settings.padding
					,passthrough:passthrough || settings.passthrough
					,onBeforeStep:settings.onBeforeStep
					,onAfterStep:settings.onAfterStep
					,onStep:settings.onStep
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
				if( !arr.transition ){
					arr.transition = settings.transition;
				}
				if( !arr.minWidth ){
					arr.minWidth = settings.minWidth;
				}
				if( !arr.minHeight ){
					arr.minHeight = settings.minHeight;
				}
				if( !arr.maxWidth ){
					arr.maxWidth = settings.maxWidth;
				}
				if( !arr.maxHeight ){
					arr.maxHeight = settings.maxHeight;
				}
				if( arr.padding === undefined || arr.padding === null ){
					arr.padding = settings.padding
				}
				if( arr.borderWidth === undefined || arr.borderWidth === null ){
					arr.borderWidth = settings.borderWidth
				}
				if( arr.passthrough === undefined || arr.passthrough === null ){
					arr.passthrough = settings.passthrough
				}
				if( !arr.onBeforeStep ){
					arr.onBeforeStep = settings.onBeforeStep
				}
				if( !arr.onAfterStep ){
					arr.onAfterStep = settings.onAfterStep
				}
				if( !arr.onStep ){
					arr.onStep = settings.onStep
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
						a[i] = $.extend( {}, a[i], b[i] );
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
			
			return $.grep( a, function(n, i){
				return (n != undefined && n != null);
			} );
		}

		/**
		* Events
		*/
		,_onPrevClick = function( e )
		{
			e.preventDefault();
			prevStep();
		}
		
		,_onNextClick = function( e )
		{
			e.preventDefault();
			nextStep();
		}
		
		,_onCloseClick = function( e )
		{
			e.preventDefault();
			close();
		}

		,_onWindowResize = function( e )
		{
			clearTimeout(resizeTimer);
			resizeTimer = setTimeout(function(){
				goto( currentStepIndex );
			}, 250);
		}
		
		/**
		* Constructor
		*/
		,init = function()
		{
			if( args ){
				settings = $.extend( {}, settings, args );
				settings.parent = settings.parent || document.body;
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
		self.goto = goto;
		self.stop = stop;
		
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
	}
	$.uiGlide = function( args )
	{
		return new uiGlide( args );
	}
    $.fn.uiGlide = function( args )
	{
		args.parent = $(this)[0] || null;
		return new uiGlide( args );
	}
	
}( jQuery ));
