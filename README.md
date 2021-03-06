uiGlance jQuery Plugin - An easy way to guide your users
================================

**A cross-browser, mobile-responsive JavaScript and jQuery plugin** for user interface (UI) guides, interactive application help, introductions and step-by-step workflow demonstrations.

The uiGlance plugin supports all major browsers **(Chrome, Firefox, Safari, IE)** and will even work as as far back as **IE7+ if you include [Respond.js](https://github.com/scottjehl/Respond) and [html5shiv](https://github.com/aFarkas/html5shiv)**.

1. Appearance is controlled through CSS and can easily be restyled.
2. Animations and presentation can be enhanced through numerous timed callbacks.
3. Leverages HTML5 data attributes, but can be completely unobtrusive with all configuration set through JavaScript.
4. Lightweight: 12KB of JavaScript (less than 7KBs gzipped).

## Getting Started

### Try it out

jQuery demonstration: [See here](https://www.wcpdigital.com.au/git/uiglance/example/jQuery/)

Standalone demonstration: [See here](https://www.wcpdigital.com.au/git/uiglance/example/Standalone/)

### Including it on your page

Include jQuery, the uiGlance plugin and a CSS theme file on a page. Then apply a few simple "data-" attributes to the elements you want to highlight or explain. Once ready, initialise the guide by calling the `uiGlance` method, followed by the `open` method.

```html
<head>
	<link href="uiglance.default.css" rel="stylesheet">
</head>
<body>
	<div id="myDOMElementId" data-uigset="demo_set" data-uigstep="0" data-uigtitle="My title" 
		data-uigdesc="My description" data-uightml="<p>Custom inner HTML content</p>">
	...
	</div>
	<div id="myDOMElementId2" data-uigset="demo_set" data-uigstep="1" data-uigtitle="My other title" 
		data-uigdesc="My other description" data-uightml="<p>The other custom HTML content</p>">
	...
	</div>
</body>
<script src="jquery.js"></script>
<script src="jquery.uiglance.js"></script>
<script>
var uig = $("body").uiGlance().open();
</script>
```
Alternatively, if you don't use jQuery or want to incorporate uiGlance into your choice of library, you can use the `Standalone` version (which is almost the same in every way).

```html
<script src="uiglance.js"></script>
<script>
var uig = new uiGlance().open();
</script>
```

It's also entirely possible to configure uiGlance using JavaScript notation.
```js
var uig = new uiGlance( {
	onBeforeOpen:function(ui){
		console.log("Before Open");
	}
	,onAfterClose:function(ui){
		console.log("After Close");
	}
	,steps:[
		{
			element:document.getElementById("myDOMElementId")
			,index:0
			,set:"demo_set"
			,title:"Welcome to uiGlance"
			,desc:"uiGlance helps you communicate with your audience."
			,html:"<p>Custom inner HTML content</p>"
			,onStep:function(ui){
				var stepIdx = ui.getCurrentStepIndex()
					,step = ui.getCurrentStep()
					,stepTitle = step.title
					,stepSet = step.set;
				console.log("On Step. Set: '"+stepSet+"', Index: '"+stepIdx+"', title: '"+stepTitle+"'" );
			}
		}
		,{
			element:document.getElementById("myDOMElementId2")
			,index:1
			,set:"demo_set"
		}
	]
} ).open();
```

## Reporting issues and contributing code

See the [Contributing Guidelines](CONTRIBUTING.md) for details.

##License
Copyright &copy; [WCP Digital](http://www.wcpdigital.com.au) &amp; [Patrick Purcell](http://patrickpurcell.bio)<br>
Licensed under the [MIT license](http://www.opensource.org/licenses/mit-license.php).
<br>**Commercial use?** Go for it! You can include it in your commercial products.
