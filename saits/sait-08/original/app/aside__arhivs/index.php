<section class="aside__arhivs js__aside__arhivs">
	<div class="aa__menu-name">Архив</div>
	<nav id="site-navigation" class="primary-navigation" role="navigation">
		<?php
		wp_nav_menu(
			array(
				'menu'  => '3',
				'theme_location'  => 'primary',
				'menu_class'      => 'menu-wrapper',
				'container_class' => 'primary-menu-container',
				'items_wrap'      => '<ul id="primary-menu-list" class="%2$s">%3$s</ul>',
				'fallback_cb'     => false,
			)
		);
		// prettier-ignore
		?>
	</nav>
</section>