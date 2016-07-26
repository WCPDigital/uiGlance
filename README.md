[uiSlide jQuery Plugin](http://uislide.com/) - An easy way to guide and help your users
================================

A cross-browser, mobile-responsive JavaScript and jQuery plugin for user interface (UI) guides, interactive application help and workflow demonstrations.

## Getting Started

### Downloading the prebuilt files

Prebuilt files can be downloaded from http://uiglide.com

### Including it on your page

Include jQuery, the uiSlide plugin and CSS theme file on a page. Then select a form to validate and call the `validate` method.

```html
<body>
	<div data-uigstep="0" data-uigtitle="My title" data-uigdesc="My description" data-uightml="<p>Custom inner HTML content</p>">
	...
	</div>
</body>
<script src="jquery.js"></script>
<script src="jquery.uislide.js"></script>
<script>
$("body").uiSlide();
</script>
```

For more information on how to setup a rules and customizations, [check the documentation](http://uiglide.com/documentation/).

## Reporting issues and contributing code

See the [Contributing Guidelines](CONTRIBUTING.md) for details.

## License
Copyright &copy; WCP Digital &amp; Patrick Purcell<br>
Licensed under the MIT license.
