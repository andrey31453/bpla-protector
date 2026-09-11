<!doctype html>
<html class="no-js" <?php language_attributes(); ?>>

<head>
	<meta charset="<?php bloginfo('charset'); ?>" />
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<?php wp_head(); ?>
	<link rel="shortcut icon" type="image/x-icon"
		href="/wp-content/themes/twentytwentyone/images/_template/icons/favicon.ico" />
	<link href="/wp-content/themes/twentytwentyone/css/style.min.css" rel="stylesheet">
	<script defer src="/wp-content/themes/twentytwentyone/js/script.min.js"></script>
	<script defer src="//unpkg.com/alpinejs"></script>
</head>

<body class="body" x-bind:class="`submenu_open--${submenu_open}`" x-data="body"
	x-init="body_data = await get_data('/wp-content/themes/twentytwentyone/json/_template/data.json'); $nextTick(() => {if (main) {new Ajax(main, body_data)}})"
	x-transition:enter-end="enter-end" x-transition:leave="leave" x-transition:leave-start="leave-start"
	x-transition:leave-end="leave-end">
	<div class="__overlay" data-close="true"></div>
	<div x-data="menu" class="menu__overlay"
		x-on:click="submenu_open = false; change_submenu_enable_scroll(submenu_open)"></div>
	<header class="header">